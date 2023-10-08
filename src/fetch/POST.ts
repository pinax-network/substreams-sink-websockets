import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { logger } from "../logger.js";
import { verify } from "../verify.js";
import { PUBLIC_KEY } from "../config.js";
import { Server } from "bun";

export default async function (req: Request, server: Server) {
    // get headers and body from POST request
    const timestamp = req.headers.get("x-signature-timestamp");
    const signature = req.headers.get("x-signature-ed25519");
    const body = await req.text();
    logger.info('POST', {timestamp, signature, body});

    // validate request
    if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
    if (!signature) return new Response("missing required signature in headers", { status: 400 });
    if (!body) return new Response("missing body", { status: 400 });

    // verify request
    const msg = Buffer.from(timestamp + body);
    const isVerified = verify(msg, signature, PUBLIC_KEY);
    if (!isVerified) return new Response("invalid request signature", { status: 401 });
    const json = JSON.parse(body);

    // Webhook handshake (not WebSocket related)
    if (json?.message == "PING") {
        const message = JSON.parse(body).message;
        logger.info('PING WebHook handshake', {message});
        return new Response("OK");
    }
    // Get data from Substreams metadata
    const { clock, manifest, session } = json;
    const { moduleHash, chain } = manifest;
    const { traceId } = session;

    // publish message to subscribers
    const bytes = server.publish(moduleHash, body);
    logger.info('server.publish', {bytes, block: clock.number, timestamp: clock.timestamp, moduleHash});

    // additional publish message specified by chain
    server.publish(`${chain}:${moduleHash}`, body)

    // Metrics for published messages
    // response is:
    // 0 if the message was dropped
    // -1 if backpressure was applied
    // or the number of bytes sent.
    if ( bytes > 0 ) {
        prometheus.bytes_published.inc(bytes);
        prometheus.published_messages.inc(1);
    }
    // Metrics for incoming WebHook
    prometheus.webhook_messages.labels({moduleHash, chain}).inc(1);
    prometheus.trace_id.labels({traceId}).inc(1);

    // Upsert moduleHash into SQLite DB
    sqlite.replace(db, "chain", chain, timestamp);
    sqlite.replace(db, "moduleHash", moduleHash, timestamp);
    sqlite.replace(db, "moduleHashByChain", `${chain}:${moduleHash}`, timestamp);
    sqlite.replace(db, "traceId", `${chain}:${traceId}`, timestamp);

    return new Response("OK");
}