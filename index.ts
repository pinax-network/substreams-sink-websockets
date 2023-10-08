#!/usr/bin/env node

import { Server } from "bun";
import GET from "./src/GET.js";
import POST from "./src/POST.js";
import * as sqlite from "./src/sqlite.js";
import * as websocket from "./src/websocket/index.js";
import { logger } from "./src/logger.js";
import { HOSTNAME, PORT, PUBLIC_KEY, SQLITE_FILENAME } from "./src/config.js";

logger.info(`Server listening on http://${HOSTNAME}:${PORT}`);
logger.info("Verifying with PUBLIC_KEY", PUBLIC_KEY);
logger.info("Reading SQLITE_FILENAME", SQLITE_FILENAME);

// SQLite DB
export const db = sqlite.createDb(SQLITE_FILENAME);

export interface ServerWebSocketData {
  key: string;
}

Bun.serve<ServerWebSocketData>({
  port: PORT,
  hostname: HOSTNAME,
  async fetch(req: Request, server: Server) {
    if ( req.method == "GET" ) return GET(req, server);
    if ( req.method == "POST") return POST(req, server);
    return new Response("Invalid request", { status: 400 });
  },

  websocket: {
    open: websocket.open,
    close: websocket.close,
    message(ws, message) {
      try {
        // handle websocket methods from user message
        const { method, params, id } = websocket.parseMessage(message);
        if ( method === "ping" ) return websocket.ping(ws, id);
        if ( method === "time" ) return websocket.time(ws, id);
        if ( method === "subscribe" ) return websocket.subscribe(ws, params, id);
      } catch (e) {
        // handle errors
        logger.error(e);
        ws.send(JSON.stringify({ status: 400, error: { message: e.message } }));
        ws.close();
      }
    }
  },
});
