import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>, code: number, reason: string) {
    prometheus.active_connections.dec(1);
    prometheus.disconnects.inc(1);
    logger.info('close', {key: ws.data.key, remoteAddress: ws.remoteAddress, code, reason});
}
