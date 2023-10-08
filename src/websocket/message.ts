import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import { parseMessage } from "./parseMessage.js";
import ping from "./ping.js";
import time from "./time.js";
import subscribe from "./subscribe.js";
import * as prometheus from "../prometheus.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>, message: string|Buffer) {
    try {
        // handle websocket methods from user message
        const { method, params, id } = parseMessage(message);
        // TO-DO add Prometheus metrics to track total message requests by method

        if ( method === "ping" ) return ping(ws, id);
        if ( method === "time" ) return time(ws, id);
        if ( method === "subscribe" ) return subscribe(ws, params, id);
    } catch (e) {
        // handle errors
        logger.error(e);
        ws.send(JSON.stringify({ status: 400, error: { message: e.message } }));
        ws.close();
        // TO-DO add Prometheus metrics to track total errors
    }
}