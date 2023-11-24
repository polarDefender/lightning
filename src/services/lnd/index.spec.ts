import 'dotenv/config' // TODO - test env
import { expect } from 'chai'
import * as Types from '../../../proto/autogenerated/ts/types.js';
import NewLightningHandler, { LightningHandler, LoadLndSettingsFromEnv } from '../lnd/index.js'
let lnd: LightningHandler
export const ignore = true
export const setup = async () => {
    lnd = NewLightningHandler(LoadLndSettingsFromEnv(true), console.log, console.log, console.log)
    await lnd.Warmup()
}
export const teardown = () => {
    lnd.Stop()
}

export default async (d: (message: string, failure?: boolean) => void) => {
    const info = await lnd.GetInfo()
    expect(info.alias).to.equal("alice")
    d("get alias ok")

    const addr = await lnd.NewAddress(Types.AddressType.WITNESS_PUBKEY_HASH)
    console.log(addr)
    d("new address ok")

    const invoice = await lnd.NewInvoice(1000, "", 60 * 60)
    console.log(invoice)
    d("new invoice ok")

    const res = await lnd.EstimateChainFees("bcrt1qajzzx453x9fx5gtlyax8zrsennckrw3syd2llt", 1000, 100)
    console.log(res)
    d("estimate fee ok")
    //const res = await this.lnd.OpenChannel("025ed7fc85fc05a07fc5acc13a6e3836cd11c5587c1d400afcd22630a9e230eb7a", "", 20000, 0)
}