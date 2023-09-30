import { Server } from "bun";
import { Database } from "bun:sqlite";
import { HOSTNAME, PORT, PUBLIC_KEY } from "./src/config.js";
import { verify } from "./src/verify.js";
import { banner } from "./src/banner.js";
import * as sqlite from "./src/sqlite.js";
import * as prometheus from "./src/prometheus.js";
import { checkHealth } from "./src/health.js";
import { toJSON } from "./src/http.js";
console.log(`Server listening on http://${HOSTNAME}:${PORT}`);
console.log("Verifying with PUBLIC_KEY", PUBLIC_KEY);

const moduleHashes = new Set<string>(); // TO-DO: replace using SQLite DB

// Create SQLite DB
const db = new Database("./db.sqlite", {create: true}); // TO-DO as .env variable
sqlite.create(db, "moduleHash");
sqlite.create(db, "traceId");

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
      return undefined;
    }

    // GET request
    if ( req.method == "GET" ) {
      const { pathname } = new URL(req.url);
      if ( pathname === "/") return new Response(banner())
      if ( pathname === "/health") return toJSON(await checkHealth(db));
      if ( pathname === "/metrics") return new Response(await prometheus.registry.metrics());
      if ( pathname === "/moduleHash") return toJSON(sqlite.findAll(db, "moduleHash"));
      if ( pathname === "/traceId") return toJSON(sqlite.findAll(db, "traceId"));
      return new Response("Not found", { status: 400 });
    }

    // POST request
    if ( req.method == "POST") {
      // get headers and body from POST request
      const timestamp = req.headers.get("x-signature-timestamp");
      const signature = req.headers.get("x-signature-ed25519");
      const body = await req.text();

      // validate request
      if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
      if (!signature) return new Response("missing required signature in headers", { status: 400 });
      if (!body) return new Response("missing body", { status: 400 });

      // verify request
      const msg = Buffer.from(timestamp + body);
      const isVerified = verify(msg, signature, PUBLIC_KEY);
      if (!isVerified) return new Response("invalid request signature", { status: 401 });
      // publish message to subscribers

      if (JSON.parse(body).message == "PING"){
        const message = JSON.parse(body).message;
        const response = server.publish(message, body);
        const pingBytes = Buffer.byteLength(body + message, 'utf8')

        prometheus.bytesPublished.inc(pingBytes);

        console.log('server.publish', {response, message});
        return new Response("OK");
      }
      // Get data from Substreams metadata
      const { clock, manifest } = JSON.parse(body);
      const { moduleHash } = manifest;
      const bytes = Buffer.byteLength(body + moduleHash, 'utf8')
      const response = server.publish(moduleHash, body);

      // Prometheus Metrics
      prometheus.bytesPublished.inc(bytes);
      prometheus.publishedMessages.inc(1);
      prometheus.customMetric(moduleHash)
      moduleHashes.add(moduleHash);

      // Insert moduleHash into SQLite DB
      const traceId = "654b2e1fd43e8468863595baaad68627"; // TO-DO: get traceId from Substreams metadata
      sqlite.insert(db, "moduleHash", moduleHash, timestamp);
      sqlite.insert(db, "traceId", traceId, timestamp);

      console.log('server.publish', {response, block: clock.number, timestamp: clock.timestamp, moduleHash});

      return new Response("OK");
    }
    return new Response("Invalid request", { status: 400 });
  },
  websocket: {
    open(ws) {
      prometheus.activeConnections.inc(1);
      prometheus.connected.inc(1);
      console.log('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
      ws.send("🎉 Connected!");
    },
    close(ws, code, reason) {
      prometheus.activeConnections.dec(1);
      prometheus.disconnects.inc(1);
      console.log('close', {key: ws.data.key, remoteAddress: ws.remoteAddress, code, reason});
    },
    message(ws, message) {
      const moduleHash = String(message);
      if ( moduleHash === "PING" ) {
        ws.send("PONG");
        ws.ping();
        ws.pong();
        console.log('PONG', {key: ws.data.key, remoteAddress: ws.remoteAddress});
        return;
      }
      if ( !moduleHashes.has(moduleHash) ) {
        ws.send(`❌ ModuleHash ${moduleHash} not found.`);
        console.log('moduleHash not found', {key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
        return;
      }
      if ( ws.isSubscribed(moduleHash) ) {
        ws.send(`⚠️ Already subscribed to ${moduleHash}.`);
        console.log('already subscribed', {key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
        return;
      }
      ws.subscribe(moduleHash);
      ws.send(`🚀 Subscribed to ${moduleHash}!`);
      console.log('subscribed', {key: ws.data.key, remoteAddress: ws.remoteAddress, moduleHash});
    },
  },
});