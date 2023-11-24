import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";
import { increment, select, replaceTime, replace } from "../sqlite.js";
import { db } from "../../index.js";

function checkLimit(limitData: any, ws: ServerWebSocket<ServerWebSocketData>) {
    //check if exists
    if (limitData === undefined || limitData.length === 0) {

        return increment(db, "connection", ws.remoteAddress, 1, Date.now());
    }
    // If timestamp is less than 5 minutes ago, increment counter assuming rate limit has not been reached
    if (Number(limitData[0].timestamp) > Date.now() - 300000) {
        // rate limit
        if (Number(limitData[0]?.value) >= 300) {
            throw new Error("Too many connections from this IP address");
        }

        return increment(db, "connection", ws.remoteAddress, 1, limitData[0].timestamp);
    }
    // If timestamp is more than 5 minutes ago, reset timestamp & counter to 1
    return replaceTime(db, "connection", ws.remoteAddress, 1, Date.now());
}

export default function (ws: ServerWebSocket<ServerWebSocketData>) {

    // auto-subscribe to moduleHash + chain
    const { moduleHash, chain } = ws.data;
    if (moduleHash) {
        const topic = chain ? `${chain}:${moduleHash}` : moduleHash;
        ws.subscribe(topic);
    }

    // rate limit IP by 300 connections per 5 minutes
    try {
        const limitData = select(db, "connection", ws.remoteAddress);

        checkLimit(limitData, ws);

        if ( select(db, "connection", ws.remoteAddress)) {
        }
        prometheus.connection_active.inc(1);
        prometheus.connection_open.inc(1);
        logger.info('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
    } catch(e) {
        logger.error(e);
        ws.send(JSON.stringify({ status: 429, error: { message: e.message } }));
        ws.close();
    }
}
