import * as prometheus from "../prometheus.js";
import * as sqlite from "../sqlite.js";
import { db } from "../../index.js";
import { logger } from "../logger.js";
import { Server } from "bun";
import { toText } from "./cors.js";
import { insertMessages } from "./messages.js";
import { signatureEd25519 } from "../webhook/singatureEd25519.js";
import { BodySchema } from "substreams-sink-webhook/auth";

export default async function (req: Request, server: Server) {
  // validate Ed25519 signature
  const text = await req.text();
  const signatureResult = await signatureEd25519(req, text);
  if ("error" in signatureResult) return signatureResult.error;

  // parse POST body payload
  try {
    // prometheus.requests.inc();
    const body = BodySchema.parse(JSON.parse(text));

    // PING
    if ("message" in body) {
      if (body.message === "PING") return toText("OK");
      return toText("invalid body", 400);
    }

    // validate POST request
    if ("data" in body) {
        // Get data from Substreams metadata
        const { clock, manifest, session } = body;
        const { moduleHash, chain } = manifest ?? {};
        const { traceId } = session ?? {};
        const { timestamp } = clock;

        // publish message to subscribers
        const bytes = server.publish(moduleHash, text);
        logger.info('server.publish', {bytes, block: clock.number, timestamp: clock.timestamp, moduleHash});

        // additional publish message specified by chain
        server.publish(`${chain}:${moduleHash}`, text)

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

        // Set timestamp as key to filter recent messages
        insertMessages( db, traceId, text, chain );

        return toText("OK");
    }
  } catch (err) {
    logger.error(err);
    // prometheus.request_errors?.inc();
    prometheus.webhook_message_received_errors.inc(1);
    return toText("invalid request", 400);
  }
}