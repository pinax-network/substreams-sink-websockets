import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";

// https://developers.binance.com/docs/binance-trading-api/websocket_api#test-connectivity
export default function (ws: ServerWebSocket<ServerWebSocketData>, id?: string) {
    ws.send(JSON.stringify({id, status: 200, data: {msg: "pong"}}));
    logger.info('ping', {id, key: ws.data.key, remoteAddress: ws.remoteAddress});
}