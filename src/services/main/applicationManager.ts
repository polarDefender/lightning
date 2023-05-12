import jwt from 'jsonwebtoken'
import Storage from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import UserManager from './userManager.js'
import { MainSettings } from './settings.js'
import PaymentManager from './paymentManager.js'
import { InboundOptionals, defaultInvoiceExpiry } from '../storage/paymentStorage.js'
import { ApplicationUser } from '../storage/entity/ApplicationUser.js'
export default class {
    storage: Storage
    settings: MainSettings
    userManager: UserManager
    paymentManager: PaymentManager
    constructor(storage: Storage, settings: MainSettings, userManager: UserManager, paymentManager: PaymentManager) {
        this.storage = storage
        this.settings = settings
        this.userManager = userManager
        this.paymentManager = paymentManager
    }
    SignAppToken(appId: string): string {
        return jwt.sign({ appId }, this.settings.jwtSecret);
    }
    DecodeAppToken(token?: string): string {
        if (!token) throw new Error("empty app token provided")
        let t = token
        if (token.startsWith("Bearer ")) {
            t = token.substring("Bearer ".length)
        }
        if (!t) throw new Error("no app token provided")
        const decoded = jwt.verify(token, this.settings.jwtSecret) as { appId?: string }
        if (!decoded.appId) {
            throw new Error("the provided token is not an app token")
        }
        return decoded.appId
    }

    async SetMockAppUserBalance(appId: string, req: Types.SetMockAppUserBalanceRequest) {
        const user = await this.storage.applicationStorage.GetOrCreateApplicationUser(appId, req.user_identifier, 0)
        await this.paymentManager.SetMockUserBalance(user.user.user_id, req.amount)
    }

    async SetMockAppBalance(appId: string, req: Types.SetMockAppBalanceRequest) {
        const app = await this.storage.applicationStorage.GetApplication(appId)
        await this.paymentManager.SetMockUserBalance(app.owner.user_id, req.amount)
    }


    async AddApp(req: Types.AddAppRequest): Promise<Types.AddAppResponse> {
        const app = await this.storage.applicationStorage.AddApplication(req.name)
        return {
            app: {
                id: app.app_id,
                name: app.name,
                balance: 0
            },
            auth_token: this.SignAppToken(app.app_id)
        }
    }

    async GetApp(appId: string): Promise<Types.Application> {
        const app = await this.storage.applicationStorage.GetApplication(appId)
        return {
            name: app.name,
            id: app.app_id,
            balance: app.owner.balance_sats
        }
    }

    async AddAppUser(appId: string, req: Types.AddAppUserRequest): Promise<Types.AppUser> {
        let u: ApplicationUser
        if (req.fail_if_exists) {
            u = await this.storage.applicationStorage.AddApplicationUser(appId, req.identifier, req.balance)
        } else {
            u = await this.storage.applicationStorage.GetOrCreateApplicationUser(appId, req.identifier, req.balance)
        }
        return {
            identifier: u.identifier,
            info: {
                userId: u.user.user_id,
                balance: u.user.balance_sats
            },
            max_withdrawable: this.paymentManager.GetMaxPayableInvoice(u.user.balance_sats, true)
        }
    }

    async AddAppInvoice(appId: string, req: Types.AddAppInvoiceRequest): Promise<Types.NewInvoiceResponse> {
        const app = await this.storage.applicationStorage.GetApplication(appId)
        const payer = await this.storage.applicationStorage.GetOrCreateApplicationUser(appId, req.payer_identifier, 0)
        const opts: InboundOptionals = { callbackUrl: req.http_callback_url, expiry: defaultInvoiceExpiry, expectedPayer: payer.user, linkedApplication: app }
        return this.paymentManager.NewInvoice(app.owner.user_id, req.invoice_req, opts)
    }

    async AddAppUserInvoice(appId: string, req: Types.AddAppUserInvoiceRequest): Promise<Types.NewInvoiceResponse> {
        const app = await this.storage.applicationStorage.GetApplication(appId)
        const receiver = await this.storage.applicationStorage.GetApplicationUser(appId, req.receiver_identifier)
        const payer = await this.storage.applicationStorage.GetOrCreateApplicationUser(appId, req.payer_identifier, 0)
        const opts: InboundOptionals = { callbackUrl: req.http_callback_url, expiry: defaultInvoiceExpiry, expectedPayer: payer.user, linkedApplication: app }
        const appUserInvoice = await this.paymentManager.NewInvoice(receiver.user.user_id, req.invoice_req, opts)
        return {
            invoice: appUserInvoice.invoice
        }
    }

    async GetAppUser(appId: string, req: Types.GetAppUserRequest): Promise<Types.AppUser> {
        const user = await this.storage.applicationStorage.GetApplicationUser(appId, req.user_identifier)
        const max = this.paymentManager.GetMaxPayableInvoice(user.user.balance_sats, true)
        console.log(max, user.user.balance_sats)
        return {
            max_withdrawable: max, identifier: req.user_identifier, info: {
                userId: user.user.user_id, balance: user.user.balance_sats
            }
        }
    }

    async PayAppUserInvoice(appId: string, req: Types.PayAppUserInvoiceRequest): Promise<Types.PayAppUserInvoiceResponse> {
        const app = await this.storage.applicationStorage.GetApplication(appId)
        const appUser = await this.storage.applicationStorage.GetApplicationUser(appId, req.user_identifier)
        return this.paymentManager.PayInvoice(appUser.user.user_id, req, app)
    }

    async SendAppUserToAppUserPayment(appId: string, req: Types.SendAppUserToAppUserPaymentRequest): Promise<void> {
        const fromUser = await this.storage.applicationStorage.GetApplicationUser(appId, req.from_user_identifier)
        const toUser = await this.storage.applicationStorage.GetApplicationUser(appId, req.to_user_identifier)
        const app = await this.storage.applicationStorage.GetApplication(appId)
        await this.paymentManager.SendUserToUserPayment(fromUser.user.user_id, toUser.user.user_id, req.amount, app)
    }

    async SendAppUserToAppPayment(appId: string, req: Types.SendAppUserToAppPaymentRequest): Promise<void> {
        const fromUser = await this.storage.applicationStorage.GetApplicationUser(appId, req.from_user_identifier)
        const app = await this.storage.applicationStorage.GetApplication(appId)
        await this.paymentManager.SendUserToUserPayment(fromUser.user.user_id, app.owner.user_id, req.amount, app)
    }
    async GetAppUserLNURLInfo(appId: string, req: Types.GetAppUserLNURLInfoRequest): Promise<Types.LnurlPayInfoResponse> {
        const user = await this.storage.applicationStorage.GetApplicationUser(appId, req.user_identifier)
        return this.paymentManager.GetLnurlPayInfoFromUser(user.user.user_id, req.base_url_override)
    }
}