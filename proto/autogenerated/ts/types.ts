// This file was autogenerated from a .proto file, DO NOT EDIT!

export type GuestContext = {
}
export type UserContext = {
    user_id: string
}
export type AdminContext = {
    admin_id: string
}
export type AuthContext = GuestContext | UserContext | AdminContext

export type Health_Query = {
}
export type Health_RouteParams = {
}
export type Health_Context = Health_Query & Health_RouteParams & GuestContext
export type EncryptionExchange_Query = {
}
export type EncryptionExchange_RouteParams = {
}
export type EncryptionExchange_Context = EncryptionExchange_Query & EncryptionExchange_RouteParams & GuestContext
export type LndGetInfo_Query = {
}
export type LndGetInfo_RouteParams = {
}
export type LndGetInfo_Context = LndGetInfo_Query & LndGetInfo_RouteParams & AdminContext
export type AddUser_Query = {
}
export type AddUser_RouteParams = {
}
export type AddUser_Context = AddUser_Query & AddUser_RouteParams & GuestContext
export type AuthUser_Query = {
}
export type AuthUser_RouteParams = {
}
export type AuthUser_Context = AuthUser_Query & AuthUser_RouteParams & GuestContext
export type NewAddress_Query = {
}
export type NewAddress_RouteParams = {
}
export type NewAddress_Context = NewAddress_Query & NewAddress_RouteParams & UserContext
export type PayAddress_Query = {
}
export type PayAddress_RouteParams = {
}
export type PayAddress_Context = PayAddress_Query & PayAddress_RouteParams & UserContext
export type NewInvoice_Query = {
}
export type NewInvoice_RouteParams = {
}
export type NewInvoice_Context = NewInvoice_Query & NewInvoice_RouteParams & UserContext
export type PayInvoice_Query = {
}
export type PayInvoice_RouteParams = {
}
export type PayInvoice_Context = PayInvoice_Query & PayInvoice_RouteParams & UserContext
export type OpenChannel_Query = {
}
export type OpenChannel_RouteParams = {
}
export type OpenChannel_Context = OpenChannel_Query & OpenChannel_RouteParams & UserContext
export type GetLnurlWithdrawLink_Query = {
}
export type GetLnurlWithdrawLink_RouteParams = {
}
export type GetLnurlWithdrawLink_Context = GetLnurlWithdrawLink_Query & GetLnurlWithdrawLink_RouteParams & UserContext
export type GetLnurlWithdrawInfo_Query = {
    k1?: string
}
export type GetLnurlWithdrawInfo_RouteParams = {
}
export type GetLnurlWithdrawInfo_Context = GetLnurlWithdrawInfo_Query & GetLnurlWithdrawInfo_RouteParams & GuestContext
export type HandleLnurlWithdraw_Query = {
    k1?: string
    pr?: string
}
export type HandleLnurlWithdraw_RouteParams = {
}
export type HandleLnurlWithdraw_Context = HandleLnurlWithdraw_Query & HandleLnurlWithdraw_RouteParams & GuestContext
export type GetLnurlPayInfo_Query = {
    k1?: string
}
export type GetLnurlPayInfo_RouteParams = {
}
export type GetLnurlPayInfo_Context = GetLnurlPayInfo_Query & GetLnurlPayInfo_RouteParams & GuestContext
export type HandleLnurlPay_Query = {
    k1?: string
    amount?: string
}
export type HandleLnurlPay_RouteParams = {
}
export type HandleLnurlPay_Context = HandleLnurlPay_Query & HandleLnurlPay_RouteParams & GuestContext
export type GetLNURLChannelLink_Query = {
}
export type GetLNURLChannelLink_RouteParams = {
}
export type GetLNURLChannelLink_Context = GetLNURLChannelLink_Query & GetLNURLChannelLink_RouteParams & UserContext
export type ServerMethods = {
    Health?: (ctx: Health_Context) => Promise<void>
    EncryptionExchange?: (ctx: EncryptionExchange_Context, req: EncryptionExchangeRequest) => Promise<void>
    LndGetInfo?: (ctx: LndGetInfo_Context, req: LndGetInfoRequest) => Promise<LndGetInfoResponse>
    AddUser?: (ctx: AddUser_Context, req: AddUserRequest) => Promise<AddUserResponse>
    AuthUser?: (ctx: AuthUser_Context, req: AuthUserRequest) => Promise<AuthUserResponse>
    NewAddress?: (ctx: NewAddress_Context, req: NewAddressRequest) => Promise<NewAddressResponse>
    PayAddress?: (ctx: PayAddress_Context, req: PayAddressRequest) => Promise<PayAddressResponse>
    NewInvoice?: (ctx: NewInvoice_Context, req: NewInvoiceRequest) => Promise<NewInvoiceResponse>
    PayInvoice?: (ctx: PayInvoice_Context, req: PayInvoiceRequest) => Promise<PayInvoiceResponse>
    OpenChannel?: (ctx: OpenChannel_Context, req: OpenChannelRequest) => Promise<OpenChannelResponse>
    GetLnurlWithdrawLink?: (ctx: GetLnurlWithdrawLink_Context) => Promise<LnurlLinkResponse>
    GetLnurlWithdrawInfo?: (ctx: GetLnurlWithdrawInfo_Context) => Promise<LnurlWithdrawInfoResponse>
    HandleLnurlWithdraw?: (ctx: HandleLnurlWithdraw_Context) => Promise<void>
    GetLnurlPayInfo?: (ctx: GetLnurlPayInfo_Context) => Promise<LnurlPayInfoResponse>
    HandleLnurlPay?: (ctx: HandleLnurlPay_Context) => Promise<HandleLnurlPayResponse>
    GetLNURLChannelLink?: (ctx: GetLNURLChannelLink_Context) => Promise<LnurlLinkResponse>
}

export enum AddressType {
    WITNESS_PUBKEY_HASH = 'WITNESS_PUBKEY_HASH',
    NESTED_PUBKEY_HASH = 'NESTED_PUBKEY_HASH',
    TAPROOT_PUBKEY = 'TAPROOT_PUBKEY',
}
const enumCheckAddressType = (e?: AddressType): boolean => {
    for (const v in AddressType) if (e === v) return true
    return false
}

export type OptionsBaseMessage = {
    allOptionalsAreSet?: true
}

export type NewInvoiceRequest = {
    amountSats: number
    memo: string
}
export const NewInvoiceRequestOptionalFields: [] = []
export type NewInvoiceRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    amountSats_CustomCheck?: (v: number) => boolean
    memo_CustomCheck?: (v: string) => boolean
}
export const NewInvoiceRequestValidate = (o?: NewInvoiceRequest, opts: NewInvoiceRequestOptions = {}, path: string = 'NewInvoiceRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.amountSats !== 'number') return new Error(`${path}.amountSats: is not a number`)
    if (opts.amountSats_CustomCheck && !opts.amountSats_CustomCheck(o.amountSats)) return new Error(`${path}.amountSats: custom check failed`)

    if (typeof o.memo !== 'string') return new Error(`${path}.memo: is not a string`)
    if (opts.memo_CustomCheck && !opts.memo_CustomCheck(o.memo)) return new Error(`${path}.memo: custom check failed`)

    return null
}

export type LnurlWithdrawInfoResponse = {
    tag: string
    callback: string
    k1: string
    defaultDescription: string
    minWithdrawable: number
    maxWithdrawable: number
    balanceCheck: string
    payLink: string
}
export const LnurlWithdrawInfoResponseOptionalFields: [] = []
export type LnurlWithdrawInfoResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    tag_CustomCheck?: (v: string) => boolean
    callback_CustomCheck?: (v: string) => boolean
    k1_CustomCheck?: (v: string) => boolean
    defaultDescription_CustomCheck?: (v: string) => boolean
    minWithdrawable_CustomCheck?: (v: number) => boolean
    maxWithdrawable_CustomCheck?: (v: number) => boolean
    balanceCheck_CustomCheck?: (v: string) => boolean
    payLink_CustomCheck?: (v: string) => boolean
}
export const LnurlWithdrawInfoResponseValidate = (o?: LnurlWithdrawInfoResponse, opts: LnurlWithdrawInfoResponseOptions = {}, path: string = 'LnurlWithdrawInfoResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.tag !== 'string') return new Error(`${path}.tag: is not a string`)
    if (opts.tag_CustomCheck && !opts.tag_CustomCheck(o.tag)) return new Error(`${path}.tag: custom check failed`)

    if (typeof o.callback !== 'string') return new Error(`${path}.callback: is not a string`)
    if (opts.callback_CustomCheck && !opts.callback_CustomCheck(o.callback)) return new Error(`${path}.callback: custom check failed`)

    if (typeof o.k1 !== 'string') return new Error(`${path}.k1: is not a string`)
    if (opts.k1_CustomCheck && !opts.k1_CustomCheck(o.k1)) return new Error(`${path}.k1: custom check failed`)

    if (typeof o.defaultDescription !== 'string') return new Error(`${path}.defaultDescription: is not a string`)
    if (opts.defaultDescription_CustomCheck && !opts.defaultDescription_CustomCheck(o.defaultDescription)) return new Error(`${path}.defaultDescription: custom check failed`)

    if (typeof o.minWithdrawable !== 'number') return new Error(`${path}.minWithdrawable: is not a number`)
    if (opts.minWithdrawable_CustomCheck && !opts.minWithdrawable_CustomCheck(o.minWithdrawable)) return new Error(`${path}.minWithdrawable: custom check failed`)

    if (typeof o.maxWithdrawable !== 'number') return new Error(`${path}.maxWithdrawable: is not a number`)
    if (opts.maxWithdrawable_CustomCheck && !opts.maxWithdrawable_CustomCheck(o.maxWithdrawable)) return new Error(`${path}.maxWithdrawable: custom check failed`)

    if (typeof o.balanceCheck !== 'string') return new Error(`${path}.balanceCheck: is not a string`)
    if (opts.balanceCheck_CustomCheck && !opts.balanceCheck_CustomCheck(o.balanceCheck)) return new Error(`${path}.balanceCheck: custom check failed`)

    if (typeof o.payLink !== 'string') return new Error(`${path}.payLink: is not a string`)
    if (opts.payLink_CustomCheck && !opts.payLink_CustomCheck(o.payLink)) return new Error(`${path}.payLink: custom check failed`)

    return null
}

export type HandleLnurlPayResponse = {
    pr: string
    routes: Empty[]
}
export const HandleLnurlPayResponseOptionalFields: [] = []
export type HandleLnurlPayResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    pr_CustomCheck?: (v: string) => boolean
    routes_ItemOptions?: EmptyOptions
    routes_CustomCheck?: (v: Empty[]) => boolean
}
export const HandleLnurlPayResponseValidate = (o?: HandleLnurlPayResponse, opts: HandleLnurlPayResponseOptions = {}, path: string = 'HandleLnurlPayResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.pr !== 'string') return new Error(`${path}.pr: is not a string`)
    if (opts.pr_CustomCheck && !opts.pr_CustomCheck(o.pr)) return new Error(`${path}.pr: custom check failed`)

    if (!Array.isArray(o.routes)) return new Error(`${path}.routes: is not an array`)
    for (let index = 0; index < o.routes.length; index++) {
        const routesErr = EmptyValidate(o.routes[index], opts.routes_ItemOptions, `${path}.routes[${index}]`)
        if (routesErr !== null) return routesErr
    }
    if (opts.routes_CustomCheck && !opts.routes_CustomCheck(o.routes)) return new Error(`${path}.routes: custom check failed`)

    return null
}

export type LndGetInfoResponse = {
    alias: string
}
export const LndGetInfoResponseOptionalFields: [] = []
export type LndGetInfoResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    alias_CustomCheck?: (v: string) => boolean
}
export const LndGetInfoResponseValidate = (o?: LndGetInfoResponse, opts: LndGetInfoResponseOptions = {}, path: string = 'LndGetInfoResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.alias !== 'string') return new Error(`${path}.alias: is not a string`)
    if (opts.alias_CustomCheck && !opts.alias_CustomCheck(o.alias)) return new Error(`${path}.alias: custom check failed`)

    return null
}

export type NewAddressRequest = {
    addressType: AddressType
}
export const NewAddressRequestOptionalFields: [] = []
export type NewAddressRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    addressType_CustomCheck?: (v: AddressType) => boolean
}
export const NewAddressRequestValidate = (o?: NewAddressRequest, opts: NewAddressRequestOptions = {}, path: string = 'NewAddressRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (!enumCheckAddressType(o.addressType)) return new Error(`${path}.addressType: is not a valid AddressType`)
    if (opts.addressType_CustomCheck && !opts.addressType_CustomCheck(o.addressType)) return new Error(`${path}.addressType: custom check failed`)

    return null
}

export type PayAddressResponse = {
    txId: string
}
export const PayAddressResponseOptionalFields: [] = []
export type PayAddressResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    txId_CustomCheck?: (v: string) => boolean
}
export const PayAddressResponseValidate = (o?: PayAddressResponse, opts: PayAddressResponseOptions = {}, path: string = 'PayAddressResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.txId !== 'string') return new Error(`${path}.txId: is not a string`)
    if (opts.txId_CustomCheck && !opts.txId_CustomCheck(o.txId)) return new Error(`${path}.txId: custom check failed`)

    return null
}

export type LnurlPayInfoResponse = {
    tag: string
    callback: string
    maxSendable: number
    minSendable: number
    metadata: string
}
export const LnurlPayInfoResponseOptionalFields: [] = []
export type LnurlPayInfoResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    tag_CustomCheck?: (v: string) => boolean
    callback_CustomCheck?: (v: string) => boolean
    maxSendable_CustomCheck?: (v: number) => boolean
    minSendable_CustomCheck?: (v: number) => boolean
    metadata_CustomCheck?: (v: string) => boolean
}
export const LnurlPayInfoResponseValidate = (o?: LnurlPayInfoResponse, opts: LnurlPayInfoResponseOptions = {}, path: string = 'LnurlPayInfoResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.tag !== 'string') return new Error(`${path}.tag: is not a string`)
    if (opts.tag_CustomCheck && !opts.tag_CustomCheck(o.tag)) return new Error(`${path}.tag: custom check failed`)

    if (typeof o.callback !== 'string') return new Error(`${path}.callback: is not a string`)
    if (opts.callback_CustomCheck && !opts.callback_CustomCheck(o.callback)) return new Error(`${path}.callback: custom check failed`)

    if (typeof o.maxSendable !== 'number') return new Error(`${path}.maxSendable: is not a number`)
    if (opts.maxSendable_CustomCheck && !opts.maxSendable_CustomCheck(o.maxSendable)) return new Error(`${path}.maxSendable: custom check failed`)

    if (typeof o.minSendable !== 'number') return new Error(`${path}.minSendable: is not a number`)
    if (opts.minSendable_CustomCheck && !opts.minSendable_CustomCheck(o.minSendable)) return new Error(`${path}.minSendable: custom check failed`)

    if (typeof o.metadata !== 'string') return new Error(`${path}.metadata: is not a string`)
    if (opts.metadata_CustomCheck && !opts.metadata_CustomCheck(o.metadata)) return new Error(`${path}.metadata: custom check failed`)

    return null
}

export type Empty = {
}
export const EmptyOptionalFields: [] = []
export type EmptyOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
}
export const EmptyValidate = (o?: Empty, opts: EmptyOptions = {}, path: string = 'Empty::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    return null
}

export type NewAddressResponse = {
    address: string
}
export const NewAddressResponseOptionalFields: [] = []
export type NewAddressResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    address_CustomCheck?: (v: string) => boolean
}
export const NewAddressResponseValidate = (o?: NewAddressResponse, opts: NewAddressResponseOptions = {}, path: string = 'NewAddressResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.address !== 'string') return new Error(`${path}.address: is not a string`)
    if (opts.address_CustomCheck && !opts.address_CustomCheck(o.address)) return new Error(`${path}.address: custom check failed`)

    return null
}

export type OpenChannelRequest = {
    destination: string
    fundingAmount: number
    pushAmount: number
    closeAddress: string
}
export const OpenChannelRequestOptionalFields: [] = []
export type OpenChannelRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    destination_CustomCheck?: (v: string) => boolean
    fundingAmount_CustomCheck?: (v: number) => boolean
    pushAmount_CustomCheck?: (v: number) => boolean
    closeAddress_CustomCheck?: (v: string) => boolean
}
export const OpenChannelRequestValidate = (o?: OpenChannelRequest, opts: OpenChannelRequestOptions = {}, path: string = 'OpenChannelRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.destination !== 'string') return new Error(`${path}.destination: is not a string`)
    if (opts.destination_CustomCheck && !opts.destination_CustomCheck(o.destination)) return new Error(`${path}.destination: custom check failed`)

    if (typeof o.fundingAmount !== 'number') return new Error(`${path}.fundingAmount: is not a number`)
    if (opts.fundingAmount_CustomCheck && !opts.fundingAmount_CustomCheck(o.fundingAmount)) return new Error(`${path}.fundingAmount: custom check failed`)

    if (typeof o.pushAmount !== 'number') return new Error(`${path}.pushAmount: is not a number`)
    if (opts.pushAmount_CustomCheck && !opts.pushAmount_CustomCheck(o.pushAmount)) return new Error(`${path}.pushAmount: custom check failed`)

    if (typeof o.closeAddress !== 'string') return new Error(`${path}.closeAddress: is not a string`)
    if (opts.closeAddress_CustomCheck && !opts.closeAddress_CustomCheck(o.closeAddress)) return new Error(`${path}.closeAddress: custom check failed`)

    return null
}

export type AddUserRequest = {
    callbackUrl: string
    name: string
    secret: string
}
export const AddUserRequestOptionalFields: [] = []
export type AddUserRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    callbackUrl_CustomCheck?: (v: string) => boolean
    name_CustomCheck?: (v: string) => boolean
    secret_CustomCheck?: (v: string) => boolean
}
export const AddUserRequestValidate = (o?: AddUserRequest, opts: AddUserRequestOptions = {}, path: string = 'AddUserRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.callbackUrl !== 'string') return new Error(`${path}.callbackUrl: is not a string`)
    if (opts.callbackUrl_CustomCheck && !opts.callbackUrl_CustomCheck(o.callbackUrl)) return new Error(`${path}.callbackUrl: custom check failed`)

    if (typeof o.name !== 'string') return new Error(`${path}.name: is not a string`)
    if (opts.name_CustomCheck && !opts.name_CustomCheck(o.name)) return new Error(`${path}.name: custom check failed`)

    if (typeof o.secret !== 'string') return new Error(`${path}.secret: is not a string`)
    if (opts.secret_CustomCheck && !opts.secret_CustomCheck(o.secret)) return new Error(`${path}.secret: custom check failed`)

    return null
}

export type PayInvoiceRequest = {
    invoice: string
    amount: number
}
export const PayInvoiceRequestOptionalFields: [] = []
export type PayInvoiceRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    invoice_CustomCheck?: (v: string) => boolean
    amount_CustomCheck?: (v: number) => boolean
}
export const PayInvoiceRequestValidate = (o?: PayInvoiceRequest, opts: PayInvoiceRequestOptions = {}, path: string = 'PayInvoiceRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.invoice !== 'string') return new Error(`${path}.invoice: is not a string`)
    if (opts.invoice_CustomCheck && !opts.invoice_CustomCheck(o.invoice)) return new Error(`${path}.invoice: custom check failed`)

    if (typeof o.amount !== 'number') return new Error(`${path}.amount: is not a number`)
    if (opts.amount_CustomCheck && !opts.amount_CustomCheck(o.amount)) return new Error(`${path}.amount: custom check failed`)

    return null
}

export type PayInvoiceResponse = {
    preimage: string
}
export const PayInvoiceResponseOptionalFields: [] = []
export type PayInvoiceResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    preimage_CustomCheck?: (v: string) => boolean
}
export const PayInvoiceResponseValidate = (o?: PayInvoiceResponse, opts: PayInvoiceResponseOptions = {}, path: string = 'PayInvoiceResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.preimage !== 'string') return new Error(`${path}.preimage: is not a string`)
    if (opts.preimage_CustomCheck && !opts.preimage_CustomCheck(o.preimage)) return new Error(`${path}.preimage: custom check failed`)

    return null
}

export type LnurlLinkResponse = {
    lnurl: string
    k1: string
}
export const LnurlLinkResponseOptionalFields: [] = []
export type LnurlLinkResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    lnurl_CustomCheck?: (v: string) => boolean
    k1_CustomCheck?: (v: string) => boolean
}
export const LnurlLinkResponseValidate = (o?: LnurlLinkResponse, opts: LnurlLinkResponseOptions = {}, path: string = 'LnurlLinkResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.lnurl !== 'string') return new Error(`${path}.lnurl: is not a string`)
    if (opts.lnurl_CustomCheck && !opts.lnurl_CustomCheck(o.lnurl)) return new Error(`${path}.lnurl: custom check failed`)

    if (typeof o.k1 !== 'string') return new Error(`${path}.k1: is not a string`)
    if (opts.k1_CustomCheck && !opts.k1_CustomCheck(o.k1)) return new Error(`${path}.k1: custom check failed`)

    return null
}

export type NewInvoiceResponse = {
    invoice: string
}
export const NewInvoiceResponseOptionalFields: [] = []
export type NewInvoiceResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    invoice_CustomCheck?: (v: string) => boolean
}
export const NewInvoiceResponseValidate = (o?: NewInvoiceResponse, opts: NewInvoiceResponseOptions = {}, path: string = 'NewInvoiceResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.invoice !== 'string') return new Error(`${path}.invoice: is not a string`)
    if (opts.invoice_CustomCheck && !opts.invoice_CustomCheck(o.invoice)) return new Error(`${path}.invoice: custom check failed`)

    return null
}

export type OpenChannelResponse = {
    channelId: string
}
export const OpenChannelResponseOptionalFields: [] = []
export type OpenChannelResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    channelId_CustomCheck?: (v: string) => boolean
}
export const OpenChannelResponseValidate = (o?: OpenChannelResponse, opts: OpenChannelResponseOptions = {}, path: string = 'OpenChannelResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.channelId !== 'string') return new Error(`${path}.channelId: is not a string`)
    if (opts.channelId_CustomCheck && !opts.channelId_CustomCheck(o.channelId)) return new Error(`${path}.channelId: custom check failed`)

    return null
}

export type AddUserResponse = {
    userId: string
    authToken: string
}
export const AddUserResponseOptionalFields: [] = []
export type AddUserResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    userId_CustomCheck?: (v: string) => boolean
    authToken_CustomCheck?: (v: string) => boolean
}
export const AddUserResponseValidate = (o?: AddUserResponse, opts: AddUserResponseOptions = {}, path: string = 'AddUserResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.userId !== 'string') return new Error(`${path}.userId: is not a string`)
    if (opts.userId_CustomCheck && !opts.userId_CustomCheck(o.userId)) return new Error(`${path}.userId: custom check failed`)

    if (typeof o.authToken !== 'string') return new Error(`${path}.authToken: is not a string`)
    if (opts.authToken_CustomCheck && !opts.authToken_CustomCheck(o.authToken)) return new Error(`${path}.authToken: custom check failed`)

    return null
}

export type AuthUserRequest = {
    name: string
    secret: string
}
export const AuthUserRequestOptionalFields: [] = []
export type AuthUserRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    name_CustomCheck?: (v: string) => boolean
    secret_CustomCheck?: (v: string) => boolean
}
export const AuthUserRequestValidate = (o?: AuthUserRequest, opts: AuthUserRequestOptions = {}, path: string = 'AuthUserRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.name !== 'string') return new Error(`${path}.name: is not a string`)
    if (opts.name_CustomCheck && !opts.name_CustomCheck(o.name)) return new Error(`${path}.name: custom check failed`)

    if (typeof o.secret !== 'string') return new Error(`${path}.secret: is not a string`)
    if (opts.secret_CustomCheck && !opts.secret_CustomCheck(o.secret)) return new Error(`${path}.secret: custom check failed`)

    return null
}

export type AuthUserResponse = {
    userId: string
    authToken: string
}
export const AuthUserResponseOptionalFields: [] = []
export type AuthUserResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    userId_CustomCheck?: (v: string) => boolean
    authToken_CustomCheck?: (v: string) => boolean
}
export const AuthUserResponseValidate = (o?: AuthUserResponse, opts: AuthUserResponseOptions = {}, path: string = 'AuthUserResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.userId !== 'string') return new Error(`${path}.userId: is not a string`)
    if (opts.userId_CustomCheck && !opts.userId_CustomCheck(o.userId)) return new Error(`${path}.userId: custom check failed`)

    if (typeof o.authToken !== 'string') return new Error(`${path}.authToken: is not a string`)
    if (opts.authToken_CustomCheck && !opts.authToken_CustomCheck(o.authToken)) return new Error(`${path}.authToken: custom check failed`)

    return null
}

export type EncryptionExchangeRequest = {
    publicKey: string
    deviceId: string
}
export const EncryptionExchangeRequestOptionalFields: [] = []
export type EncryptionExchangeRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    publicKey_CustomCheck?: (v: string) => boolean
    deviceId_CustomCheck?: (v: string) => boolean
}
export const EncryptionExchangeRequestValidate = (o?: EncryptionExchangeRequest, opts: EncryptionExchangeRequestOptions = {}, path: string = 'EncryptionExchangeRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.publicKey !== 'string') return new Error(`${path}.publicKey: is not a string`)
    if (opts.publicKey_CustomCheck && !opts.publicKey_CustomCheck(o.publicKey)) return new Error(`${path}.publicKey: custom check failed`)

    if (typeof o.deviceId !== 'string') return new Error(`${path}.deviceId: is not a string`)
    if (opts.deviceId_CustomCheck && !opts.deviceId_CustomCheck(o.deviceId)) return new Error(`${path}.deviceId: custom check failed`)

    return null
}

export type LndGetInfoRequest = {
    nodeId: number
}
export const LndGetInfoRequestOptionalFields: [] = []
export type LndGetInfoRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    nodeId_CustomCheck?: (v: number) => boolean
}
export const LndGetInfoRequestValidate = (o?: LndGetInfoRequest, opts: LndGetInfoRequestOptions = {}, path: string = 'LndGetInfoRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.nodeId !== 'number') return new Error(`${path}.nodeId: is not a number`)
    if (opts.nodeId_CustomCheck && !opts.nodeId_CustomCheck(o.nodeId)) return new Error(`${path}.nodeId: custom check failed`)

    return null
}

export type PayAddressRequest = {
    address: string
    amoutSats: number
    targetConf: number
}
export const PayAddressRequestOptionalFields: [] = []
export type PayAddressRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    address_CustomCheck?: (v: string) => boolean
    amoutSats_CustomCheck?: (v: number) => boolean
    targetConf_CustomCheck?: (v: number) => boolean
}
export const PayAddressRequestValidate = (o?: PayAddressRequest, opts: PayAddressRequestOptions = {}, path: string = 'PayAddressRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.address !== 'string') return new Error(`${path}.address: is not a string`)
    if (opts.address_CustomCheck && !opts.address_CustomCheck(o.address)) return new Error(`${path}.address: custom check failed`)

    if (typeof o.amoutSats !== 'number') return new Error(`${path}.amoutSats: is not a number`)
    if (opts.amoutSats_CustomCheck && !opts.amoutSats_CustomCheck(o.amoutSats)) return new Error(`${path}.amoutSats: custom check failed`)

    if (typeof o.targetConf !== 'number') return new Error(`${path}.targetConf: is not a number`)
    if (opts.targetConf_CustomCheck && !opts.targetConf_CustomCheck(o.targetConf)) return new Error(`${path}.targetConf: custom check failed`)

    return null
}

