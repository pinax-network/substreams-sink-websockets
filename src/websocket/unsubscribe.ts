import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData, db } from "../../index.js";
import * as sqlite from "../sqlite.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>, params: {[key: string]: any}, id?: string) {
    const { chain, block } = params;
    let { moduleHash } = params;

    if ( block === true ) {
        moduleHash = sqlite.selectAll(db, "moduleHash")[0].key;
    }

    const topic = chain ? `${chain}:${moduleHash}` : moduleHash;

    if (ws.isSubscribed(topic)) {
        ws.unsubscribe(topic)

    }

    logger.info('unsubscribed', {id, key: ws.data.key, remoteAddress: ws.remoteAddress});
}