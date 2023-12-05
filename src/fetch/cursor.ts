import { handleMessages, selectMessages } from "./messages.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { toText } from "./cors.js";


export function latestCursor(req: Request) {
    const { searchParams} = new URL(req.url);
    const chain = searchParams.get("chain");
    const moduleHash = searchParams.get("moduleHash");

    if ( !sqlite.exists(db, "chain", chain) && chain != null) throw new Error(`Chain [${chain}] not found.`);
    if ( !sqlite.exists(db, "moduleHash", moduleHash) && moduleHash != null) throw new Error(`ModuleHash [${moduleHash}] not found.`);

    const payload = selectMessages(db, 1, "desc", searchParams.get("chain"), searchParams.get("moduleHash"))[0]?.payload;
    return toText(JSON.parse(payload)?.cursor)
}