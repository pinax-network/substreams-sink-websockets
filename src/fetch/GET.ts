import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { Server } from "bun";
import { logger } from "../logger.js";
import openapi from "./openapi.js";
import swaggerHtml  from "../../swagger/index.html"
import swaggerFavicon from "../../swagger/favicon.png"
import { toFile, toJSON, toText } from "./cors.js";
import { selectMessages } from "./messages.js";
import { DEFAULT_RECENT_MESSAGES_LIMIT } from "../config.js";
import { checkHealth } from "./health.js";

export default async function (req: Request, server: Server) {
    const { pathname, searchParams} = new URL(req.url);

    // Bun automatically returns a 101 Switching Protocols
    // if the upgrade succeeds
    const key = req.headers.get("sec-websocket-key")
    const chain = searchParams.get("chain")
    const moduleHash = searchParams.get("moduleHash");
    const distinct = searchParams.get("distinct");
    const success = server.upgrade(req, {data: {key, chain, moduleHash}});
    let limit = Number(searchParams.get("limit"));
    let sort = searchParams.get("sort");

    // error handling
    if (limit === null || limit === 0) limit = DEFAULT_RECENT_MESSAGES_LIMIT;
    if (isNaN(Number(limit))) return toText("limit must be a number", 400 );
    if (sort === null) sort = "desc";
    if (distinct !== "true" && distinct !== null) return toText("distinct must be set to true if declared", 400 );
    if (distinct === "true" && chain) return toText("chain cannot be set if distinct is set to true", 400 );
    if (sort !== "asc" && sort !== "desc") return toText("sort must be asc or desc", 400 );

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
    if ( pathname === "/messages") return selectMessages(db, chain, moduleHash, limit, distinct, sort);

    return toText("Not found", 400 );
}