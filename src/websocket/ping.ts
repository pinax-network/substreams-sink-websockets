import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";

// https://developers.binance.com/docs/binance-trading-api/websocket_api#test-connectivity
export default function (ws: ServerWebSocket<ServerWebSocketData>, id?: string) {
    prometheus.pings.inc(1);
    ws.send(JSON.stringify({id, status: 200, data: {}}));
    logger.info('ping', {id, key: ws.data.key, remoteAddress: ws.remoteAddress});
}