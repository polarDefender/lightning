/**
 * @format
 */

export interface PaymentV2 {
  payment_hash: string

  creation_date: string

  payment_preimage: string

  value_sat: string

  value_msat: string

  payment_request: string

  status: 'UNKNOWN' | 'IN_FLIGHT' | 'SUCCEEDED' | 'FAILED'

  fee_sat: number

  fee_msat: number

  creation_time_ns: string

  payment_index: string

  failure_reason:
    | 'FAILURE_REASON_NONE'
    | 'FAILURE_REASON_TIMEOUT'
    | 'FAILURE_REASON_NO_ROUTE'
    | 'FAILURE_REASON_ERROR'
    | 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS'
    | 'FAILURE_REASON_INSUFFICIENT_BALANCE'
}

enum FeatureBit {
  DATALOSS_PROTECT_REQ = 0,
  DATALOSS_PROTECT_OPT = 1,
  INITIAL_ROUING_SYNC = 3,
  UPFRONT_SHUTDOWN_SCRIPT_REQ = 4,
  UPFRONT_SHUTDOWN_SCRIPT_OPT = 5,
  GOSSIP_QUERIES_REQ = 6,
  GOSSIP_QUERIES_OPT = 7,
  TLV_ONION_REQ = 8,
  TLV_ONION_OPT = 9,
  EXT_GOSSIP_QUERIES_REQ = 10,
  EXT_GOSSIP_QUERIES_OPT = 11,
  STATIC_REMOTE_KEY_REQ = 12,
  STATIC_REMOTE_KEY_OPT = 13,
  PAYMENT_ADDR_REQ = 14,
  PAYMENT_ADDR_OPT = 15,
  MPP_REQ = 16,
  MPP_OPT = 17
}

interface _SendPaymentV2Request {
  dest: Buffer
  /**
   * Number of satoshis to send. The fields amt and amt_msat are mutually
   * exclusive.
   */
  amt: string

  /**
   * The CLTV delta from the current height that should be used to set the
   * timelock for the final hop.
   */
  final_cltv_delta: number

  dest_features: FeatureBit[]

  dest_custom_records: Record<number, Buffer>

  /**
   * The hash to use within the payment's HTLC.
   */
  payment_hash: Buffer

  max_parts: number

  timeout_seconds: number

  no_inflight_updates: boolean

  payment_request: string

  fee_limit_sat: number
}

export type SendPaymentV2Request = Partial<_SendPaymentV2Request>

export interface SendPaymentKeysendParams {
  amt: string
  dest: string
  feeLimit: number
  finalCltvDelta?: number
  maxParts?: number
  timeoutSeconds?: number
}

export interface SendPaymentInvoiceParams {
  amt?: string
  feeLimit: number
  max_parts?: number
  payment_request: string
  timeoutSeconds?: number
}

type StreamListener = (data: any) => void

/**
 * Caution: Not all methods return an stream.
 */
interface LightningStream {
  on(ev: 'data' | 'end' | 'error' | 'status', listener: StreamListener): void
}

type LightningCB = (err: Error, data: Record<string, any>) => void

type LightningMethod = (
  args: Record<string, any>,
  cb?: LightningCB
) => LightningStream

/**
 * Makes it easier for code calling services.
 */
export interface Services {
  lightning: Record<string, LightningMethod>
  walletUnlocker: Record<string, LightningMethod>
  router: Record<string, LightningMethod>
}

export interface Utxo {
  /**
   * The type of address.
   */
  address_type: unknown

  /**
   * The address.
   */
  address: string

  /**
   * The value of the unspent coin in satoshis.
   */
  amount_sat: number

  /**
   * The pkscript in hex.
   */
  pk_script: string

  /**
   * The outpoint in format txid:n.
   */
  outpoint: unknown

  /**
   * The number of confirmations for the Utxo.
   */
  confirmations: number
}
