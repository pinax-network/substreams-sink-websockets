import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { logger } from "../logger.js";
import { verify } from "../verify.js";
import { PUBLIC_KEY } from "../config.js";
import { Server } from "bun";
import { toText } from "./cors.js";
import { insertMessages } from "./messages.js";

export default async function (req: Request, server: Server) {
    // get headers and body from POST request
    const timestamp = req.headers.get("x-signature-timestamp");
    const signature = req.headers.get("x-signature-ed25519");
    const body = await req.text();
    logger.info('POST', {timestamp, signature, body});

    // validate request
    try {
        if (!timestamp) throw new Error("missing required \'timestamp\' in headers");
        if (!signature) throw new Error("missing required \'signature\' in headers");
        if (!body) throw new Error("missing body");
    } catch (e) {
        logger.error(e);
        prometheus.webhook_message_received_errors.inc(1);
        return toText(e.message, 400 );
    }

    // verify request
    const msg = Buffer.from(timestamp + body);
    const isVerified = verify(msg, signature, PUBLIC_KEY);
    if (!isVerified) {
        prometheus.webhook_message_received_errors.inc(1);
        return toText("invalid request signature", 401 );
    }
    const json = JSON.parse(body);

    // Webhook handshake (not WebSocket related)
    if (json?.message == "PING") {
        const message = JSON.parse(body).message;
        logger.info('PING WebHook handshake', {message});
        return toText("OK");
    }
    // Get data from Substreams metadata
    const { clock, manifest, session } = json;
    const { moduleHash, chain } = manifest ?? {};
    const { traceId } = session ?? {};

    // validate POST request
    try {
        if (!clock) throw new Error("missing required \'clock\' in body");
        if (!manifest) throw new Error("missing required \'manifest\' in body");
        if (!session) throw new Error("missing required \'session\' in body");
        if (!chain) throw new Error("missing required \'chain\' in body.manifest");
        if (!moduleHash) throw new Error("missing required \'moduleHash\' in body.manifest");
        if (!traceId) throw new Error("missing required \'traceId\' in body.session");
    } catch (e) {
        logger.error(e);
        prometheus.webhook_message_received_errors.inc(1);
        return toText(e.message, 400 );
    }

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
        prometheus.publish_message_bytes.inc(bytes);
        prometheus.publish_message.inc(1);
    }
    // Metrics for incoming WebHook
    prometheus.webhook_message_received.labels({moduleHash, chain}).inc(1);
    prometheus.webhook_trace_id.labels({traceId, chain}).inc(1);

    // Upsert moduleHash into SQLite DB
    sqlite.replace(db, "chain", chain, timestamp);
    sqlite.replace(db, "moduleHash", moduleHash, timestamp);
    sqlite.replace(db, "moduleHashByChain", `${chain}:${moduleHash}`, timestamp);
    sqlite.replace(db, "traceId", `${chain}:${traceId}`, timestamp);
    //Set timestamp as key to filter recent messages

    insertMessages( db, traceId, JSON.stringify(json), chain );

    return toText("OK");
}