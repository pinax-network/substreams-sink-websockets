#!/usr/bin/env node

import { Server } from "bun";
import GET from "./src/fetch/GET.js";
import POST from "./src/fetch/POST.js";
import * as sqlite from "./src/sqlite.js";
import * as websocket from "./src/websocket/index.js";
import { HOSTNAME, PORT, SQLITE_FILENAME } from "./src/config.js";

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
    message: websocket.message,
  },
});
