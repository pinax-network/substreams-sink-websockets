import { banner } from "../banner.js";
import { checkHealth } from "../health.js";
import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { toJSON } from "../http.js";
import { Server } from "bun";
import { logger } from "../logger.js";

export default async function (req: Request, server: Server) {
    // Bun automatically returns a 101 Switching Protocols
    // if the upgrade succeeds
    const key = req.headers.get("sec-websocket-key")
    const success = server.upgrade(req, {data: {key}});
    if (success) {
      logger.info('upgrade', {key});
      return;
    }

    const { pathname } = new URL(req.url);
    if ( pathname === "/") return new Response(banner())
    if ( pathname === "/health") return checkHealth();
    if ( pathname === "/metrics") return new Response(await prometheus.registry.metrics());
    if ( pathname === "/moduleHash") return toJSON(sqlite.selectAll(db, "moduleHash"));
    if ( pathname === "/moduleHashByChain") return toJSON(sqlite.selectAll(db, "moduleHashByChain"));
    if ( pathname === "/traceId") return toJSON(sqlite.selectAll(db, "traceId"));
    if ( pathname === "/chain") return toJSON(sqlite.selectAll(db, "chain"));
    return new Response("Not found", { status: 400 });
}