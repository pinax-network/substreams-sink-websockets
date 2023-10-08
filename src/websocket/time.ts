import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";

// https://developers.binance.com/docs/binance-trading-api/websocket_api#check-server-time
export default function (ws: ServerWebSocket<ServerWebSocketData>, id?: string) {
    const serverTime = Number(Date.now());
    ws.send(JSON.stringify({id, status: 200, data: {serverTime}}));
    logger.info('time', {id, key: ws.data.key, remoteAddress: ws.remoteAddress});
}
