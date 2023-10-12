import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";
import { increment, count } from "../sqlite.js";
import { db } from "../../index.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>) {

    // auto-subscribe to moduleHash + chain
    const { moduleHash, chain } = ws.data;
    if (moduleHash) {
        const topic = chain ? `${chain}:${moduleHash}` : moduleHash;
        ws.subscribe(topic);
    }

    // rate limit IP by 300 connections per 5 minutes
    try {
        // TO-DO enforce rate limits logic
        // 1. get last timestamp
        // 1.1 if timestamp is less than 5 minutes ago, increment counter
        // 1.2 if timestamp is more than 5 minutes ago, reset timestamp & counter to 1
        // 1.3 if timestamp is null, set counter to 1 and timestamp to now
        // 2. if counter is greater than 300, throw error
        increment(db, "connection", ws.remoteAddress, 1, Number(Date.now()));
        prometheus.connection_active.inc(1);
        prometheus.connection_open.inc(1);
        logger.info('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
    } catch(e) {
        logger.error(e);
        ws.send(JSON.stringify({ status: 429, error: { message: e.message } }));
        ws.close();
    }
}
