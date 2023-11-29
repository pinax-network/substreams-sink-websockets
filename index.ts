#!/usr/bin/env node

import { Server } from "bun";
import GET from "./src/fetch/GET.js";
import POST from "./src/fetch/POST.js";
import * as sqlite from "./src/sqlite.js";
import * as websocket from "./src/websocket/index.js";
import { HOSTNAME, PORT, PUBLIC_KEYS, SQLITE_FILENAME } from "./src/config.js";
import { logger } from "./src/logger.js";

export const db = sqlite.createDb(SQLITE_FILENAME);

logger.info(`Server listening on http://${HOSTNAME}:${PORT}`);
logger.info("Verifying with PUBLIC_KEYS", PUBLIC_KEYS.join(","));
logger.info("Reading SQLITE_FILENAME", SQLITE_FILENAME);

export interface ServerWebSocketData {
  key: string;
  moduleHash?: string;
  chain?: string;
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
    message: websocket.message,
  },
});
