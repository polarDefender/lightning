import Storage from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import { Application } from '../storage/entity/Application.js'
import { HtlcEvent, HtlcEvent_EventType } from '../../../proto/lnd/router.js'
import { BalanceInfo } from '../lnd/settings.js'
import { BalanceEvent } from '../storage/entity/BalanceEvent.js'
import { ChannelBalanceEvent } from '../storage/entity/ChannelsBalanceEvent.js'
import { LightningHandler } from '../lnd/index.js'
import HtlcTracker from './htlcTracker.js'
const maxEvents = 100_000
export default class Handler {
    storage: Storage
    lnd: LightningHandler
    htlcTracker: HtlcTracker
    metrics: Types.UsageMetric[] = []
    constructor(storage: Storage, lnd: LightningHandler) {
        this.storage = storage
        this.lnd = lnd
        this.htlcTracker = new HtlcTracker(this.storage)
    }

    async HtlcCb(htlc: HtlcEvent) {
        await this.htlcTracker.onHtlcEvent(htlc)
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

    async FetchLatestForwardingEvents() {
        const latestIndex = await this.storage.metricsStorage.GetLatestForwardingIndexOffset()
        const forwards = await this.lnd.GetForwardingHistory(latestIndex)
        await Promise.all(forwards.map(async f => {
            await this.storage.metricsStorage.IncrementChannelRouting(f.chanIdIn, { forward_fee_as_input: f.fee, latest_index_offset: f.offset })
            await this.storage.metricsStorage.IncrementChannelRouting(f.chanIdOut, { forward_fee_as_output: f.fee, latest_index_offset: f.offset })
        }))
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
        const totalFees = await this.storage.paymentStorage.GetTotalFeesPaidInApp(app)
        const { receivingInvoices, receivingTransactions, outgoingInvoices, outgoingTransactions, receivingAddresses, userToUser } = await this.storage.paymentStorage.GetAppOperations(app, { from: req.from_unix, to: req.to_unix })
        let totalReceived = 0
        let totalSpent = 0
        let unpaidInvoices = 0
        let feesInRange = 0
        const operations: Types.UserOperation[] = []
        receivingInvoices.forEach(i => {
            if (i.paid_at_unix > 0) {
                totalReceived += i.paid_amount
                feesInRange += i.service_fee
                if (req.include_operations) operations.push({ type: Types.UserOperationType.INCOMING_INVOICE, amount: i.paid_amount, inbound: true, paidAtUnix: i.paid_at_unix, confirmed: true, service_fee: i.service_fee, network_fee: 0, identifier: "", operationId: "", tx_hash: "", internal: i.internal })
            } else {
                unpaidInvoices++
            }
        })
        receivingTransactions.forEach(txs => {
            txs.forEach(tx => {
                if (req.include_operations) operations.push({ type: Types.UserOperationType.INCOMING_TX, amount: tx.paid_amount, inbound: true, paidAtUnix: tx.paid_at_unix, confirmed: tx.confs > 1, service_fee: tx.service_fee, network_fee: 0, identifier: "", operationId: "", tx_hash: tx.tx_hash, internal: tx.internal })
                if (tx.confs > 1) {
                    feesInRange += tx.service_fee
                    totalReceived += tx.paid_amount
                }
            })
        })
        outgoingInvoices.forEach(i => {
            if (req.include_operations) operations.push({ type: Types.UserOperationType.OUTGOING_INVOICE, amount: i.paid_amount, inbound: false, paidAtUnix: i.paid_at_unix, confirmed: true, service_fee: i.service_fees, network_fee: i.routing_fees, identifier: "", operationId: "", tx_hash: "", internal: i.internal })
            totalSpent += i.paid_amount
            feesInRange += i.service_fees
        })
        outgoingTransactions.forEach(tx => {
            if (req.include_operations) operations.push({ type: Types.UserOperationType.OUTGOING_TX, amount: tx.paid_amount, inbound: false, paidAtUnix: tx.paid_at_unix, confirmed: tx.confs > 1, service_fee: tx.service_fees, network_fee: tx.chain_fees, identifier: "", operationId: "", tx_hash: tx.tx_hash, internal: tx.internal })
            totalSpent += tx.paid_amount
            feesInRange += tx.service_fees
        })

        userToUser.forEach(op => {
            if (req.include_operations) operations.push({ type: Types.UserOperationType.INCOMING_USER_TO_USER, amount: op.paid_amount, inbound: true, paidAtUnix: op.paid_at_unix, confirmed: true, service_fee: op.service_fees, network_fee: 0, identifier: "", operationId: "", tx_hash: "", internal: true })
            feesInRange += op.service_fees
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

            received: totalReceived,
            spent: totalSpent,
            available: balanceSum,
            fees: feesInRange,
            total_fees: totalFees,
            invoices: receivingInvoices.length,

            operations
        }
    }

    async GetChannelsInfo() {
        const { channels } = await this.lnd.ListChannels()
        let totalActive = 0
        let totalInactive = 0
        channels.forEach(c => {
            if (c.active) {
                totalActive++
            } else {
                totalInactive++
            }
        })
        return {
            totalActive, totalInactive, openChannels: channels
        }
    }
    async GetPendingChannelsInfo() {
        const { pendingForceClosingChannels, pendingOpenChannels } = await this.lnd.ListPendingChannels()
        return { totalPendingClose: pendingForceClosingChannels.length, totalPendingOpen: pendingOpenChannels.length }

    }


    async GetLndMetrics(req: Types.LndMetricsRequest): Promise<Types.LndMetrics> {
        const { openChannels, totalActive, totalInactive } = await this.GetChannelsInfo()
        const { totalPendingOpen, totalPendingClose } = await this.GetPendingChannelsInfo()
        const { channels: closedChannels } = await this.lnd.ListClosedChannels()
        const rawRouting = await this.storage.metricsStorage.GetChannelRouting({ from: req.from_unix, to: req.to_unix })
        const routingMap: Record<string, Types.ChannelRouting> = {}
        rawRouting.forEach(r => {
            if (!routingMap[r.channel_id]) {
                routingMap[r.channel_id] = {
                    channel_id: r.channel_id,
                    send_errors: 0,
                    receive_errors: 0,
                    forward_errors_as_input: 0,
                    forward_errors_as_output: 0,
                    missed_forward_fee_as_input: 0,
                    missed_forward_fee_as_output: 0,
                    forward_fee_as_input: 0,
                    forward_fee_as_output: 0,
                    events_number: 0
                }
            }
            routingMap[r.channel_id].send_errors += r.send_errors
            routingMap[r.channel_id].receive_errors += r.receive_errors
            routingMap[r.channel_id].forward_errors_as_input += r.forward_errors_as_input
            routingMap[r.channel_id].forward_errors_as_output += r.forward_errors_as_output
            routingMap[r.channel_id].missed_forward_fee_as_input += r.missed_forward_fee_as_input
            routingMap[r.channel_id].missed_forward_fee_as_output += r.missed_forward_fee_as_output
            routingMap[r.channel_id].forward_fee_as_input += r.forward_fee_as_input
            routingMap[r.channel_id].forward_fee_as_output += r.forward_fee_as_output
            routingMap[r.channel_id].events_number++
        })
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
                closing_channels: totalPendingClose,
                pending_channels: totalPendingOpen,
                offline_channels: totalInactive,
                online_channels: totalActive,
                closed_channels: closedChannels.map(c => ({ capacity: Number(c.capacity), channel_id: c.chanId, closed_height: c.closeHeight })),
                open_channels: openChannels.map(c => ({ active: c.active, capacity: Number(c.capacity), channel_id: c.chanId, lifetime: Number(c.lifetime), local_balance: Number(c.localBalance), remote_balance: Number(c.remoteBalance) })),
                channel_routing: Object.values(routingMap)
            }],

        }
    }
}