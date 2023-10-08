import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>) {
    prometheus.active_connections.inc(1);
    prometheus.connected.inc(1);
    logger.info('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
}
