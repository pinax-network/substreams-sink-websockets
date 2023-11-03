import { banner } from "../banner.js";
import { checkHealth } from "../health.js";
import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { Server } from "bun";
import { logger } from "../logger.js";
import openapi from "./openapi.js";
import swaggerHtml  from "../../swagger/index.html"
import swaggerFavicon from "../../swagger/favicon.png"
import { NotFound, toFile, toJSON, toText } from "./cors.js";

export default async function (req: Request, server: Server) {
    const { pathname, searchParams} = new URL(req.url);

    // Bun automatically returns a 101 Switching Protocols
    // if the upgrade succeeds
    const key = req.headers.get("sec-websocket-key")
    const chain = searchParams.get("chain")
    const moduleHash = searchParams.get("moduleHash");
    const success = server.upgrade(req, {data: {key, chain, moduleHash}});
    if (success) {
        logger.info('upgrade', {key, chain, moduleHash});
        return;
    }

    //if ( pathname === "/") return new Response(banner())
    if ( pathname === "/" ) return toFile(Bun.file(swaggerHtml));
    if ( pathname === "/favicon.png" ) return toFile(Bun.file(swaggerFavicon));
    if ( pathname === "/health") return checkHealth();
    if ( pathname === "/metrics") return new Response(await prometheus.registry.metrics());
    if ( pathname === "/moduleHash") return toJSON(sqlite.selectAll(db, "moduleHash"));
    if ( pathname === "/moduleHashByChain") return toJSON(sqlite.selectAll(db, "moduleHashByChain"));
    if ( pathname === "/traceId") return toJSON(sqlite.selectAll(db, "traceId"));
    if ( pathname === "/chain") return toJSON(sqlite.selectAll(db, "chain"));
    return new Response("Not found", { status: 400 });
}