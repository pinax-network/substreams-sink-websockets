import { Server } from "bun";
import { HOSTNAME, PORT, PUBLIC_KEY, SQLITE_FILENAME } from "./src/config.js";
import { verify } from "./src/verify.js";
import { banner } from "./src/banner.js";
import * as sqlite from "./src/sqlite.js";
import * as prometheus from "./src/prometheus.js";
import { checkHealth } from "./src/health.js";
import { toJSON } from "./src/http.js";
import { parseMessage } from "./src/parseMessage.js";
console.log(`Server listening on http://${HOSTNAME || "0.0.0.0"}:${PORT}`);
console.log("Verifying with PUBLIC_KEY", PUBLIC_KEY);
console.log("Reading SQLITE_FILENAME", SQLITE_FILENAME);

// SQLite DB
const db = sqlite.createDb();

Bun.serve<{key: string}>({
  port: PORT,
  hostname: HOSTNAME,
  async fetch(req: Request, server: Server) {
    // Bun automatically returns a 101 Switching Protocols
    // if the upgrade succeeds
    const key = req.headers.get("sec-websocket-key")
    const success = server.upgrade(req, {data: { key }});
    if (success) {
      console.log('upgrade', {key});
      return;
    }

    // GET request
    if ( req.method == "GET" ) {
      const { pathname } = new URL(req.url);
      if ( pathname === "/") return new Response(banner())
      if ( pathname === "/health") return checkHealth();
      if ( pathname === "/metrics") return new Response(await prometheus.registry.metrics());
      if ( pathname === "/moduleHash") return toJSON(sqlite.selectAll(db, "moduleHash"));
      if ( pathname === "/traceId") return toJSON(sqlite.selectAll(db, "traceId"));
      return new Response("Not found", { status: 400 });
    }

    // POST request
    if ( req.method == "POST") {
      // get headers and body from POST request
      const timestamp = req.headers.get("x-signature-timestamp");
      const signature = req.headers.get("x-signature-ed25519");
      const body = await req.text();
      console.log('POST', {timestamp, signature, body});

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
        console.log('PING WebHook handshake', {message});
        return new Response("OK");
      }
      // Get data from Substreams metadata
      const { clock, manifest, session } = json;
      const { moduleHash } = manifest;
      const { traceId } = session;

      // publish message to subscribers
      const bytes = server.publish(moduleHash, body);
      console.log('server.publish', {bytes, block: clock.number, timestamp: clock.timestamp, moduleHash});

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
      prometheus.webhook_messages.labels({moduleHash}).inc(1);
      prometheus.trace_id.labels({traceId}).inc(1);

      // Upsert moduleHash into SQLite DB
      sqlite.replace(db, "moduleHash", moduleHash, timestamp);
      sqlite.replace(db, "traceId", traceId, timestamp);

      return new Response("OK");
    }
    return new Response("Invalid request", { status: 400 });
  },
  websocket: {
    open(ws) {
      prometheus.active_connections.inc(1);
      prometheus.connected.inc(1);
      console.log('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
    },
    close(ws, code, reason) {
      prometheus.active_connections.dec(1);
      prometheus.disconnects.inc(1);
      console.log('close', {key: ws.data.key, remoteAddress: ws.remoteAddress, code, reason});
    },
    message(ws, message) {
      const { id, method, params } = parseMessage(message);

      // validate request
      if ( id === null ) {
        const msg = 'Missing required \'id\' in JSON request.';
        console.log(message, {key: ws.data.key, remoteAddress: ws.remoteAddress, message});
        ws.send(JSON.stringify({id: null, status: 400, error: {msg}}));
        ws.close();
        return;
      }
      if ( method === null ) {
        const msg = 'Missing required \'method\' in JSON request.';
        console.log(message, {key: ws.data.key, remoteAddress: ws.remoteAddress, message});
        ws.send(JSON.stringify({id: null, status: 400, error: {msg}}));
        ws.close();
        return;
      }
      // ping
      // https://developers.binance.com/docs/binance-trading-api/websocket_api#test-connectivity
      if ( method === "ping" ) {
        prometheus.total_pings.inc(1);
        console.log('ping', {key: ws.data.key, remoteAddress: ws.remoteAddress});
        ws.send(JSON.stringify({id, status: 200, result: {}}));
        return;
      }

      // Handle Subscribe
      // TO-DO: improve error formatting
      // https://github.com/pinax-network/substreams-sink-websockets/issues/9
      const moduleHash = String(message);
      if ( ws.isSubscribed(moduleHash) ) {
        ws.send(JSON.stringify({message: `⚠️ Already subscribed to ${moduleHash}.`}));
        console.log('already subscribed', {key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
        return;
      }
      if ( !sqlite.exists(db, "moduleHash", moduleHash) ) {
        ws.send(JSON.stringify({message: `❌ ModuleHash ${moduleHash} not found.`}));
        console.log('moduleHash not found', {key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
        return;
      }
      ws.subscribe(moduleHash);
      ws.send(JSON.stringify({message: `🚀 Subscribed to ${moduleHash}!`}));
      console.log('subscribed', {key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
    },
  },
});