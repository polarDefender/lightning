import { bech32 } from 'bech32'
import Storage from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import { MainSettings } from './settings.js'
import { InboundOptionals, defaultInvoiceExpiry } from '../storage/paymentStorage.js'
import { LightningHandler } from '../lnd/index.js'
import { Application } from '../storage/entity/Application.js'
import { getLogger } from '../helpers/logger.js'
interface UserOperationInfo {
    serial_id: number
    paid_amount: number
    paid_at_unix: number
}
const defaultLnurlPayMetadata = `[["text/plain", "lnurl pay to Lightning.pub"]]`

export default class {

    storage: Storage
    settings: MainSettings
    lnd: LightningHandler
    constructor(storage: Storage, lnd: LightningHandler, settings: MainSettings) {
        this.storage = storage
        this.settings = settings
        this.lnd = lnd
    }
    getServiceFee(action: Types.UserOperationType, amount: number, appUser: boolean): number {
        switch (action) {
            case Types.UserOperationType.INCOMING_TX:
                return Math.ceil(this.settings.incomingTxFee * amount)
            case Types.UserOperationType.OUTGOING_TX:
                return Math.ceil(this.settings.outgoingTxFee * amount)
            case Types.UserOperationType.INCOMING_INVOICE:
                if (appUser) {
                    return Math.ceil(this.settings.incomingAppUserInvoiceFee * amount)
                }
                return Math.ceil(this.settings.incomingAppInvoiceFee * amount)
            case Types.UserOperationType.OUTGOING_INVOICE:
                if (appUser) {
                    return Math.ceil(this.settings.outgoingAppUserInvoiceFee * amount)
                }
                return Math.ceil(this.settings.outgoingAppInvoiceFee * amount)
            case Types.UserOperationType.OUTGOING_USER_TO_USER || Types.UserOperationType.INCOMING_USER_TO_USER:
                if (appUser) {
                    return Math.ceil(this.settings.userToUserFee * amount)
                }
                return Math.ceil(this.settings.appToUserFee * amount)
            default:
                throw new Error("Unknown service action type")
        }
    }

    async SetMockInvoiceAsPaid(req: Types.SetMockInvoiceAsPaidRequest) {
        if (!this.settings.lndSettings.mockLnd) {
            throw new Error("mock disabled, cannot set invoice as paid")
        }
        await this.lnd.SetMockInvoiceAsPaid(req.invoice, req.amount)
    }

    async SetMockUserBalance(userId: string, balance: number) {
        if (!this.settings.lndSettings.mockLnd) {
            throw new Error("mock disabled, cannot set invoice as paid")
        }
        getLogger({})("setting mock balance...")
        await this.storage.userStorage.UpdateUser(userId, { balance_sats: balance })
    }

    async NewAddress(userId: string, req: Types.NewAddressRequest): Promise<Types.NewAddressResponse> {
        const res = await this.lnd.NewAddress(req.addressType)
        const userAddress = await this.storage.paymentStorage.AddUserAddress(userId, res.address)
        return {
            address: userAddress.address
        }
    }

    async NewInvoice(userId: string, req: Types.NewInvoiceRequest, options: InboundOptionals = { expiry: defaultInvoiceExpiry }): Promise<Types.NewInvoiceResponse> {
        const user = await this.storage.userStorage.GetUser(userId)
        const res = await this.lnd.NewInvoice(req.amountSats, req.memo, options.expiry)
        const userInvoice = await this.storage.paymentStorage.AddUserInvoice(user, res.payRequest, options)
        return {
            invoice: userInvoice.invoice
        }
    }

    async lockUserWithMinBalance(userId: string, minBalance: number) {
        return this.storage.StartTransaction(async tx => {
            const user = await this.storage.userStorage.GetUser(userId, tx)
            if (user.locked) {
                throw new Error("user is already withdrawing")
            }
            if (user.balance_sats < minBalance) {
                throw new Error("insufficient balance")
            }
            // this call will fail if the user is already locked
            await this.storage.userStorage.LockUser(userId, tx)
        })
    }

    GetMaxPayableInvoice(balance: number, appUser: boolean): number {
        let maxWithinServiceFee = 0
        if (appUser) {
            maxWithinServiceFee = Math.max(0, Math.floor(balance * (1 - this.settings.outgoingAppUserInvoiceFee)))
        } else {
            maxWithinServiceFee = Math.max(0, Math.floor(balance * (1 - this.settings.outgoingAppInvoiceFee)))
        }
        return this.lnd.GetMaxWithinLimit(maxWithinServiceFee)
    }
    async DecodeInvoice(req: Types.DecodeInvoiceRequest): Promise<Types.DecodeInvoiceResponse> {
        const decoded = await this.lnd.DecodeInvoice(req.invoice)
        return {
            amount: Number(decoded.numSatoshis)
        }
    }
    async PayInvoice(userId: string, req: Types.PayInvoiceRequest, linkedApplication?: Application): Promise<Types.PayInvoiceResponse> {
        const decoded = await this.lnd.DecodeInvoice(req.invoice)
        if (decoded.numSatoshis !== 0 && req.amount !== 0) {
            throw new Error("invoice has value, do not provide amount the the request")
        }
        if (decoded.numSatoshis === 0 && req.amount === 0) {
            throw new Error("invoice has no value, an amount must be provided in the request")
        }
        const payAmount = req.amount !== 0 ? req.amount : Number(decoded.numSatoshis)
        if (!linkedApplication) {
            throw new Error("only application operations are supported") // TODO - make this check obsolete
        }
        const isAppUserPayment = userId !== linkedApplication.owner.user_id
        const serviceFee = this.getServiceFee(Types.UserOperationType.OUTGOING_INVOICE, payAmount, isAppUserPayment)
        const totalAmountToDecrement = payAmount + serviceFee

        const routingFeeLimit = this.lnd.GetFeeLimitAmount(payAmount)
        await this.lockUserWithMinBalance(userId, totalAmountToDecrement + routingFeeLimit)
        let payment
        try {
            payment = await this.lnd.PayInvoice(req.invoice, req.amount, routingFeeLimit)
            await this.storage.userStorage.UnlockUser(userId)
        } catch (err) {
            await this.storage.userStorage.UnlockUser(userId)
            throw err
        }
        await this.storage.userStorage.DecrementUserBalance(userId, totalAmountToDecrement + Number(payment.feeSat))
        if (isAppUserPayment && serviceFee > 0) {
            await this.storage.userStorage.IncrementUserBalance(linkedApplication.owner.user_id, serviceFee)
        }
        await this.storage.paymentStorage.AddUserInvoicePayment(userId, req.invoice, payAmount, Number(payment.feeSat), serviceFee)
        return {
            preimage: payment.paymentPreimage,
            amount_paid: Number(payment.valueSat)
        }
    }

    async PayAddress(userId: string, req: Types.PayAddressRequest, linkedApplication?: Application): Promise<Types.PayAddressResponse> {
        const estimate = await this.lnd.EstimateChainFees(req.address, req.amoutSats, 1)
        const vBytes = Math.ceil(Number(estimate.feeSat / estimate.satPerVbyte))
        const chainFees = vBytes * req.satsPerVByte
        const total = req.amoutSats + chainFees
        if (!linkedApplication) {
            throw new Error("only application operations are supported") // TODO - make this check obsolete
        }
        if (userId !== linkedApplication.owner.user_id) {
            throw new Error("chain operations only supported for applications")
        }
        const serviceFee = this.getServiceFee(Types.UserOperationType.OUTGOING_INVOICE, req.amoutSats, false)
        await this.lockUserWithMinBalance(userId, total + serviceFee)
        let payment
        try {
            payment = await this.lnd.PayAddress(req.address, req.amoutSats, req.satsPerVByte)
            await this.storage.userStorage.UnlockUser(userId)
        } catch (err) {
            await this.storage.userStorage.UnlockUser(userId)
            throw err
        }
        await this.storage.userStorage.DecrementUserBalance(userId, total + serviceFee)
        await this.storage.paymentStorage.AddUserTransactionPayment(userId, req.address, payment.txid, 0, req.amoutSats, chainFees, serviceFee)
        return {
            txId: payment.txid
        }
    }

    balanceCheckUrl(k1: string): string {
        return `${this.settings.serviceUrl}/api/guest/lnurl_withdraw/info?k1=${k1}`
    }

    async GetLnurlChannelLink(userId: string): Promise<Types.LnurlLinkResponse> {
        const key = await this.storage.paymentStorage.AddUserEphemeralKey(userId, 'balanceCheck')
        return {
            lnurl: this.encodeLnurl(this.balanceCheckUrl(key.key)),
            k1: key.key
        }
    }

    async GetLnurlWithdrawInfo(balanceCheckK1: string): Promise<Types.LnurlWithdrawInfoResponse> {
        throw new Error("LNURL withdraw currenlty not supported for non application users")
        /*const key = await this.storage.paymentStorage.UseUserEphemeralKey(balanceCheckK1, 'balanceCheck')
        const maxWithdrawable = this.GetMaxPayableInvoice(key.user.balance_sats)
        const callbackK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'withdraw')
        const newBalanceCheckK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'balanceCheck')
        const payInfoK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'pay')
        return {
            tag: "withdrawRequest",
            callback: `${this.settings.serviceUrl}/api/guest/lnurl_withdraw/handle`,
            defaultDescription: "lnurl withdraw from lightning.pub",
            k1: callbackK1.key,
            maxWithdrawable: maxWithdrawable * 1000,
            minWithdrawable: 10000,
            balanceCheck: this.balanceCheckUrl(newBalanceCheckK1.key),
            payLink: `${this.settings.serviceUrl}/api/guest/lnurl_pay/info?k1=${payInfoK1.key}`,
        }*/
    }

    async HandleLnurlWithdraw(k1: string, invoice: string): Promise<void> {
        const key = await this.storage.paymentStorage.UseUserEphemeralKey(k1, 'withdraw')
        try {
            await this.PayInvoice(key.user.user_id, { invoice: invoice, amount: 0 })
        } catch (err: any) {
            console.error("error sending payment for lnurl withdraw to ", key.user.user_id, err)
            throw new Error("failed to pay invoice")
        }
    }

    async GetLnurlPayInfoFromUser(userId: string, linkedApplication?: Application, baseUrl?: string): Promise<Types.LnurlPayInfoResponse> {
        const payK1 = await this.storage.paymentStorage.AddUserEphemeralKey(userId, 'pay', linkedApplication)
        const url = baseUrl ? baseUrl : `${this.settings.serviceUrl}/api/guest/lnurl_pay/handle`
        return {
            tag: 'payRequest',
            callback: `${url}?k1=${payK1.key}`,
            maxSendable: 10000000000,
            minSendable: 10000,
            metadata: defaultLnurlPayMetadata
        }
    }

    async GetLnurlPayInfoFromK1(payInfoK1: string): Promise<Types.LnurlPayInfoResponse> {
        const key = await this.storage.paymentStorage.UseUserEphemeralKey(payInfoK1, 'payInfo')
        const payK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'pay')
        return {
            tag: 'payRequest',
            callback: `${this.settings.serviceUrl}/api/guest/lnurl_pay/handle?k1=${payK1.key}`,
            maxSendable: 10000000,
            minSendable: 10000,
            metadata: defaultLnurlPayMetadata
        }
    }

    async HandleLnurlPay(payK1: string, amountMillis: number): Promise<Types.HandleLnurlPayResponse> {
        const key = await this.storage.paymentStorage.UseUserEphemeralKey(payK1, 'pay')
        const sats = amountMillis / 1000
        if (!Number.isInteger(sats)) {
            throw new Error("millisats amount must be integer sats amount")
        }
        if (!key.linkedApplication) {
            throw new Error("cannot handle lnurl for non application user")
        }
        const invoice = await this.NewInvoice(key.user.user_id, {
            amountSats: sats,
            memo: defaultLnurlPayMetadata
        }, { expiry: defaultInvoiceExpiry, linkedApplication: key.linkedApplication })
        return {
            pr: invoice.invoice,
            routes: []
        }
    }

    async OpenChannel(userId: string, req: Types.OpenChannelRequest): Promise<Types.OpenChannelResponse> { throw new Error("WIP") }

    mapOperations(operations: UserOperationInfo[], type: Types.UserOperationType, inbound: boolean): Types.UserOperations {
        if (operations.length === 0) {
            return {
                fromIndex: 0,
                toIndex: 0,
                operations: []
            }
        }
        return {
            toIndex: operations[0].serial_id,
            fromIndex: operations[operations.length - 1].serial_id,
            operations: operations.map((o: UserOperationInfo): Types.UserOperation => ({
                inbound,
                type,
                amount: o.paid_amount,
                paidAtUnix: o.paid_at_unix
            }))
        }
    }

    async GetUserOperations(userId: string, req: Types.GetUserOperationsRequest): Promise<Types.GetUserOperationsResponse> {
        const [outgoingInvoices, outgoingTransactions, incomingInvoices, incomingTransactions, incomingUserToUser, outgoingUserToUser] = await Promise.all([
            this.storage.paymentStorage.GetUserInvoicePayments(userId, req.latestOutgoingInvoice),
            this.storage.paymentStorage.GetUserTransactionPayments(userId, req.latestOutgoingTx),
            this.storage.paymentStorage.GetUserInvoicesFlaggedAsPaid(userId, req.latestIncomingInvoice),
            this.storage.paymentStorage.GetUserReceivingTransactions(userId, req.latestIncomingTx),
            this.storage.paymentStorage.GetUserToUserReceivedPayments(userId, req.latestIncomingUserToUserPayment),
            this.storage.paymentStorage.GetUserToUserSentPayments(userId, req.latestOutgoingUserToUserPayment)
        ])
        return {
            latestIncomingInvoiceOperations: this.mapOperations(incomingInvoices, Types.UserOperationType.INCOMING_INVOICE, true),
            latestIncomingTxOperations: this.mapOperations(incomingTransactions, Types.UserOperationType.INCOMING_TX, true),
            latestOutgoingInvoiceOperations: this.mapOperations(outgoingInvoices, Types.UserOperationType.OUTGOING_INVOICE, false),
            latestOutgoingTxOperations: this.mapOperations(outgoingTransactions, Types.UserOperationType.OUTGOING_TX, false),
            latestIncomingUserToUserPayemnts: this.mapOperations(incomingUserToUser, Types.UserOperationType.INCOMING_USER_TO_USER, true),
            latestOutgoingUserToUserPayemnts: this.mapOperations(outgoingUserToUser, Types.UserOperationType.OUTGOING_USER_TO_USER, false)
        }
    }

    async SendUserToUserPayment(fromUserId: string, toUserId: string, amount: number, linkedApplication?: Application) {
        if (!linkedApplication) {
            throw new Error("only application operations are supported") // TODO - make this check obsolete
        }
        await this.storage.StartTransaction(async tx => {
            const fromUser = await this.storage.userStorage.GetUser(fromUserId, tx)
            const toUser = await this.storage.userStorage.GetUser(toUserId, tx)
            if (fromUser.balance_sats < amount) {
                throw new Error("not enough balance to send user to user payment")
            }
            if (!linkedApplication) {
                throw new Error("only application operations are supported") // TODO - make this check obsolete
            }
            const isAppUserPayment = fromUser.user_id !== linkedApplication.owner.user_id
            let fee = this.getServiceFee(Types.UserOperationType.OUTGOING_USER_TO_USER, amount, isAppUserPayment)
            const toIncrement = amount - fee
            await this.storage.userStorage.DecrementUserBalance(fromUser.user_id, amount, tx)
            await this.storage.userStorage.IncrementUserBalance(toUser.user_id, toIncrement, tx)
            await this.storage.paymentStorage.AddUserToUserPayment(fromUserId, toUserId, amount, fee)
            if (isAppUserPayment && fee > 0) {
                await this.storage.userStorage.IncrementUserBalance(linkedApplication.owner.user_id, fee)
            }
        })
    }

    encodeLnurl(base: string) {
        if (!base || typeof base !== 'string') {
            throw new Error("provided string for lnurl encode is not a string or is an empty string")
        }
        let words = bech32.toWords(Buffer.from(base, 'utf8'));
        return bech32.encode('lnurl', words, 1023);
    }
}

