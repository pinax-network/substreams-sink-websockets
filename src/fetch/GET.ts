import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { Server } from "bun";
import { logger } from "../logger.js";
import openapi from "./openapi.js";
import swaggerHtml  from "../../swagger/index.html"
import swaggerFavicon from "../../swagger/favicon.png"
import { toFile, toJSON, toText } from "./cors.js";
import { handleMessages, selectMessages } from "./messages.js";
import { checkHealth } from "./health.js";
import { latestCursor } from "./cursor.js";

export default async function (req: Request, server: Server) {
    const { pathname, searchParams} = new URL(req.url);

    // Bun automatically returns a 101 Switching Protocols
    // if the upgrade succeeds
    const key = req.headers.get("sec-websocket-key")
    const chain = searchParams.get("chain");
    const moduleHash = searchParams.get("moduleHash");
    const success = server.upgrade(req, {data: {key, chain, moduleHash}});
    if (success) {
        logger.info('upgrade', {key, chain, moduleHash});
        return;
    }

    if ( pathname === "/" ) return toFile(Bun.file(swaggerHtml));
    if ( pathname === "/favicon.png" ) return toFile(Bun.file(swaggerFavicon));
    if ( pathname === "/health") return checkHealth();
    if ( pathname === "/metrics") return toText(await prometheus.registry.metrics());
    if ( pathname === "/moduleHash") return toJSON(sqlite.selectAll(db, "moduleHash"));
    if ( pathname === "/moduleHashByChain") return toJSON(sqlite.selectAll(db, "moduleHashByChain"));
    if ( pathname === "/traceId") return toJSON(sqlite.selectAll(db, "traceId"));
    if ( pathname === "/chain") return toJSON(sqlite.selectAll(db, "chain"));
    if ( pathname === "/openapi") return toJSON(openapi);
    if ( pathname === "/messages") return handleMessages(req);
    if ( pathname === "/cursor/latest") return latestCursor(req);

    return toText("Not found", 400 );
}