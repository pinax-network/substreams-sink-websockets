
import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData, db } from "../../index.js";
import * as sqlite from "../sqlite.js";
import * as prometheus from "../prometheus.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>, params: {[key: string]: any}, id?: string) {
    const { moduleHash, chain } = params;
    const topic = chain ? `${chain}:${moduleHash}` : moduleHash;
    if ( ws.isSubscribed(topic) ) throw new Error(`Already subscribed to [${topic}] topic.`);

    // Subscribe to ModuleHash by Chain
    if ( chain ) {
        if ( !sqlite.exists(db, "chain", chain) ) throw new Error(`Chain [${chain}] not found.`);
        if ( !sqlite.exists(db, "moduleHashByChain", topic) ) throw new Error(`ModuleHash [${moduleHash}] from Chain [${chain}] not found.`);

    // Subscribe to all ModuleHash
    } else {
        if ( !sqlite.exists(db, "moduleHash", moduleHash) ) throw new Error(`ModuleHash [${moduleHash}] not found.`);
    }

    // TO-DO add Prometheus metrics to track total subscriptions by topic
    ws.subscribe(topic);
    logger.info('subscribed', {id, key: ws.data.key, remoteAddress: ws.remoteAddress, topic, params});
}