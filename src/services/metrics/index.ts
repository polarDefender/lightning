import Storage from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import { Application } from '../storage/entity/Application.js'
import { HtlcEvent, HtlcEvent_EventType } from '../../../proto/lnd/router.js'
import { RoutingEvent } from '../storage/entity/RoutingEvent.js'
import { BalanceInfo } from '../lnd/settings.js'
import { BalanceEvent } from '../storage/entity/BalanceEvent.js'
import { ChannelBalanceEvent } from '../storage/entity/ChannelsBalanceEvent.js'
const maxEvents = 100_000
export default class Handler {
    storage: Storage
    metrics: Types.UsageMetric[] = []
    constructor(storage: Storage) {
        this.storage = storage
    }

    async HtlcCb(htlc: HtlcEvent) {
        const routingEvent: Partial<RoutingEvent> = {}
        routingEvent.event_type = HtlcEvent_EventType[htlc.eventType]
        routingEvent.incoming_channel_id = Number(htlc.incomingChannelId)
        routingEvent.incoming_htlc_id = Number(htlc.incomingHtlcId)
        routingEvent.outgoing_channel_id = Number(htlc.outgoingChannelId)
        routingEvent.outgoing_htlc_id = Number(htlc.outgoingHtlcId)
        routingEvent.timestamp_ns = Number(htlc.timestampNs)
        if (htlc.event.oneofKind === 'finalHtlcEvent') {
            routingEvent.offchain = htlc.event.finalHtlcEvent.offchain
            routingEvent.settled = htlc.event.finalHtlcEvent.settled
        } else if (htlc.event.oneofKind === 'forwardEvent') {
            const { info } = htlc.event.forwardEvent
            routingEvent.incoming_amt_msat = info ? Number(info.incomingAmtMsat) : undefined
            routingEvent.outgoing_amt_msat = info ? Number(info.outgoingAmtMsat) : undefined
        } else if (htlc.event.oneofKind === 'settleEvent') {
        } else if (htlc.event.oneofKind === 'subscribedEvent') {
        } else if (htlc.event.oneofKind === 'forwardFailEvent') {
            routingEvent.forward_fail_event = true
        } else if (htlc.event.oneofKind === 'linkFailEvent') {
            routingEvent.failure_string = htlc.event.linkFailEvent.failureString
            const { info } = htlc.event.linkFailEvent
            routingEvent.incoming_amt_msat = info ? Number(info.incomingAmtMsat) : undefined
            routingEvent.outgoing_amt_msat = info ? Number(info.outgoingAmtMsat) : undefined
        }
        await this.storage.metricsStorage.SaveRoutingEvent(routingEvent)
    }

    async NewBlockCb(height: number, balanceInfo: BalanceInfo) {
        const balanceEvent: Partial<BalanceEvent> = {
            block_height: height,
            confirmed_chain_balance: balanceInfo.confirmedBalance,
            unconfirmed_chain_balance: balanceInfo.unconfirmedBalance,
            total_chain_balance: balanceInfo.totalBalance,
        }
        const channelsEvents: Partial<ChannelBalanceEvent>[] = balanceInfo.channelsBalance.map(c => ({
            channel_id: c.channelId,
            local_balance_sats: c.localBalanceSats,
            remote_balance_sats: c.remoteBalanceSats,
        }))
        await this.storage.metricsStorage.SaveBalanceEvents(balanceEvent, channelsEvents)
    }

    AddMetrics(newMetrics: (Types.RequestMetric & { app_id?: string })[]) {
        const parsed: Types.UsageMetric[] = newMetrics.map(m => ({
            rpc_name: m.rpcName,
            batch: m.batch,
            nostr: m.nostr,
            batch_size: m.batchSize,
            parsed_in_nano: Number(m.parse - m.start),
            auth_in_nano: Number(m.guard - m.parse),
            validate_in_nano: Number(m.validate - m.guard),
            handle_in_nano: Number(m.handle - m.validate),
            success: !m.error,
            app_id: m.app_id ? m.app_id : "",
            processed_at_ms: m.startMs
        }))
        const len = this.metrics.push(...parsed)
        if (len > maxEvents) {
            this.metrics.splice(0, len - maxEvents)
        }
    }
    async GetUsageMetrics(): Promise<Types.UsageMetrics> {
        return {
            metrics: this.metrics
        }
    }
    async GetAppsMetrics(req: Types.AppsMetricsRequest): Promise<Types.AppsMetrics> {
        const dbApps = await this.storage.applicationStorage.GetApplications()
        const apps = await Promise.all(dbApps.map(app => this.GetAppMetrics(req, app)))
        const unlinked = await this.GetAppMetrics(req, null)
        apps.push(unlinked)
        return {
            apps
        }
    }

    async GetAppMetrics(req: Types.AppsMetricsRequest, app: Application | null): Promise<Types.AppMetrics> {
        const { receivingInvoices, receivingTransactions, outgoingInvoices, outgoingTransactions, receivingAddresses, userToUser } = await this.storage.paymentStorage.GetAppOperations(app, { from: req.from_unix, to: req.to_unix })
        let totalReceived = 0
        let totalSpent = 0
        let unpaidInvoices = 0
        const operations: Types.UserOperation[] = []
        receivingInvoices.forEach(i => {
            if (i.paid_at_unix > 0) {
                totalReceived += i.paid_amount
                if (req.include_operations) operations.push({ type: Types.UserOperationType.INCOMING_INVOICE, amount: i.paid_amount, inbound: true, paidAtUnix: i.paid_at_unix, confirmed: true, service_fee: i.service_fee, network_fee: 0, identifier: "", operationId: "", tx_hash: "", internal: i.internal })
            } else {
                unpaidInvoices++
            }
        })
        receivingTransactions.forEach(txs => {
            txs.forEach(tx => {
                if (req.include_operations) operations.push({ type: Types.UserOperationType.INCOMING_TX, amount: tx.paid_amount, inbound: true, paidAtUnix: tx.paid_at_unix, confirmed: tx.confs > 1, service_fee: tx.service_fee, network_fee: 0, identifier: "", operationId: "", tx_hash: tx.tx_hash, internal: tx.internal })
                if (tx.confs > 1) {
                    totalReceived += tx.paid_amount
                }
            })
        })
        outgoingInvoices.forEach(i => {
            if (req.include_operations) operations.push({ type: Types.UserOperationType.OUTGOING_INVOICE, amount: i.paid_amount, inbound: false, paidAtUnix: i.paid_at_unix, confirmed: true, service_fee: i.service_fees, network_fee: i.routing_fees, identifier: "", operationId: "", tx_hash: "", internal: i.internal })
            totalSpent += i.paid_amount
        })
        outgoingTransactions.forEach(tx => {
            if (req.include_operations) operations.push({ type: Types.UserOperationType.OUTGOING_TX, amount: tx.paid_amount, inbound: false, paidAtUnix: tx.paid_at_unix, confirmed: tx.confs > 1, service_fee: tx.service_fees, network_fee: tx.chain_fees, identifier: "", operationId: "", tx_hash: tx.tx_hash, internal: tx.internal })
            totalSpent += tx.paid_amount
        })

        userToUser.forEach(op => {
            if (req.include_operations) operations.push({ type: Types.UserOperationType.INCOMING_USER_TO_USER, amount: op.paid_amount, inbound: true, paidAtUnix: op.paid_at_unix, confirmed: true, service_fee: op.service_fees, network_fee: 0, identifier: "", operationId: "", tx_hash: "", internal: true })
        })

        const users = await this.storage.applicationStorage.GetApplicationUsers(app, { from: req.from_unix, to: req.to_unix })

        let totalUserWithBalance = 0
        let totalUserWithNoBalance = 0
        let totalUsersWithNegativeBalance = 0
        let totalAlwaysBeenInactive = 0
        let balanceSum = 0
        let minBalance = Number.MAX_SAFE_INTEGER
        let maxBalance = 0
        await Promise.all(users.map(async u => {
            if (u.user.balance_sats < 0) {
                totalUsersWithNegativeBalance++
            } else if (u.user.balance_sats === 0) {
                const wasActive = await this.storage.paymentStorage.UserHasOutgoingOperation(u.user.user_id)
                totalUserWithNoBalance++
                if (!wasActive) {
                    totalAlwaysBeenInactive++
                }
            } else {
                balanceSum += u.user.balance_sats
                totalUserWithBalance++
                if (u.user.balance_sats < minBalance) {
                    minBalance = u.user.balance_sats
                }
                if (u.user.balance_sats > maxBalance) {
                    maxBalance = u.user.balance_sats
                }
            }
        }))
        return {
            app: {
                name: app ? app.name : "unlinked to app",
                id: app ? app.app_id : "unlinked",
                npub: app ? (app.nostr_public_key || "") : "",
                balance: app ? app.owner.balance_sats : 0,
            },
            users: {
                total: users.length,
                always_been_inactive: totalAlwaysBeenInactive,
                balance_avg: Math.round(balanceSum / totalUserWithBalance),
                balance_median: Math.round((maxBalance + minBalance) / 2),
                no_balance: totalUserWithNoBalance,
                negative_balance: totalUsersWithNegativeBalance,
            },

            total_received: totalReceived,
            total_spent: totalSpent,
            total_available: balanceSum,

            unpaid_invoices: unpaidInvoices,

            operations
        }
    }

    async GetLndMetrics(req: Types.LndMetricsRequest): Promise<Types.LndMetrics> {
        const routingEvents = await this.storage.metricsStorage.GetRoutingEvents({ from: req.from_unix, to: req.to_unix })
        const { channelsBalanceEvents, chainBalanceEvents } = await this.storage.metricsStorage.GetBalanceEvents({ from: req.from_unix, to: req.to_unix })
        return {
            nodes: [{
                chain_balance_events: chainBalanceEvents.map(e => ({
                    block_height: e.block_height,
                    confirmed_balance: e.confirmed_chain_balance,
                    unconfirmed_balance: e.unconfirmed_chain_balance,
                    total_balance: e.total_chain_balance
                })),
                channels_balance_events: channelsBalanceEvents.map(e => ({
                    block_height: e.balance_event.block_height,
                    channel_id: e.channel_id,
                    local_balance_sats: e.local_balance_sats,
                    remote_balance_sats: e.remote_balance_sats
                })),
                routing_events: routingEvents.map(e => ({
                    event_type: e.event_type,
                    failure_string: e.failure_string || "",
                    forward_fail_event: e.forward_fail_event || false,
                    incoming_amt_msat: e.incoming_amt_msat || 0,
                    incoming_channel_id: e.incoming_channel_id || 0,
                    incoming_htlc_id: e.incoming_htlc_id || 0,
                    offchain: e.offchain || false,
                    outgoing_amt_msat: e.outgoing_amt_msat || 0,
                    outgoing_channel_id: e.outgoing_channel_id,
                    outgoing_htlc_id: e.outgoing_htlc_id,
                    settled: e.settled || false,
                    timestamp_ns: e.timestamp_ns


                }))
            }]
        }
    }
}