import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData, db } from "../../index.js";
import * as sqlite from "../sqlite.js";
import * as prometheus from "../prometheus.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>, params: {[key: string]: any}, id?: string) {
    const { moduleHash } = params;
    if ( ws.isSubscribed(moduleHash) ) throw new Error(`Already subscribed to ${moduleHash}.`);
    if ( !sqlite.exists(db, "moduleHash", moduleHash) ) throw new Error(`ModuleHash ${moduleHash} not found.`);
    ws.subscribe(moduleHash);
    logger.info('subscribed', {id, key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
}