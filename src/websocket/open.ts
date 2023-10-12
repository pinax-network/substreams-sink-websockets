import { ServerWebSocket } from "bun";
import { logger } from "../logger.js";
import { ServerWebSocketData } from "../../index.js";
import * as prometheus from "../prometheus.js";
import { increment, count } from "../sqlite.js";
import { db } from "../../index.js";

export default function (ws: ServerWebSocket<ServerWebSocketData>) {
    //set count as limit
    const count = true;
    try {
        if (count === true) {
            increment(db, "connection", ws.remoteAddress, 1, Number(Date.now()));
            prometheus.connection_active.inc(1);
            prometheus.connection_open.inc(1);
            logger.info('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
        }
    }
    catch(e) {
        logger.error(e);
        ws.send(JSON.stringify({ status: 429, error: { message: e.message } }));
        ws.close();
    }

}
