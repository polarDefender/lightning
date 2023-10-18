import { ServerOptions } from "../proto/autogenerated/ts/express_server";
import { AdminContext } from "../proto/autogenerated/ts/types";
import Main from './services/main'
import { getLogger } from './services/helpers/logger.js'
const serverOptions = (mainHandler: Main): ServerOptions => {
    const log = getLogger({})
    return {
        logger: { log, error: err => log("ERROR", err) },
        AdminAuthGuard: adminAuth,
        AppAuthGuard: async (authHeader) => { return { app_id: mainHandler.applicationManager.DecodeAppToken(stripBearer(authHeader)) } },
        UserAuthGuard: async (authHeader) => { return mainHandler.appUserManager.DecodeUserToken(stripBearer(authHeader)) },
        GuestAuthGuard: async (_) => ({}),
        encryptCallback: async (_, b) => b,
        decryptCallback: async (_, b) => b,
        //throwErrors: true
    }
}

const stripBearer = (header?: string) => {
    if (!header) {
        return ""
    }
    if (header.startsWith("Bearer ")) {
        return header.substring("Bearer ".length)
    }
    return header
}

const adminAuth = async (header: string | undefined): Promise<AdminContext> => {
    const AdminToken = process.env.ADMIN_TOKEN
    if (!AdminToken) {
        throw new Error("admin auth disabled")
    }
    if (!header) {
        throw new Error("admin header not found")
    }
    let h = header

    if (header.startsWith("Bearer ")) {
        h = header.substring("Bearer ".length)
    }
    if (h !== AdminToken) {
        throw new Error("admin token invalid")
    }
    return { admin_id: "admin1" }
}
export default serverOptions