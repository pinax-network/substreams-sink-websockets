import { Server } from "bun";
import { PORT, PUBLIC_KEY } from "./src/config.js";
import { verify } from "./src/verify.js";
import { banner } from "./src/banner.js";

console.log(`Server listening on PORT http://localhost:${PORT}`);
console.log("Verifying with PUBLIC_KEY", PUBLIC_KEY);

// internal memory of moduleHashes (used as WebSocket channels)
// TO-DO could be stored in a database (SQLite)
const moduleHashes = new Set<string>();

Bun.serve<{key: string}>({
  port: PORT,
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
      if ( pathname === "/health") return new Response("OK");
      if ( pathname === "/metrics") return new Response("TO-DO Prometheus metrics");
      return new Response("Not found", { status: 404 });
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
      const isVerified = await verify(msg, signature, PUBLIC_KEY);
      if (!isVerified) return new Response("invalid request signature", { status: 401 });

      // publish message to subscribers
      const { clock, manifest } = JSON.parse(body);
      const { moduleHash } = manifest;
      moduleHashes.add(moduleHash);
      const response = server.publish(moduleHash, body);
      console.log('server.publish', {response, block: clock.number, moduleHash});

      return new Response("OK");
    }
    return new Response("Invalid request", { status: 400 });
  },
  websocket: {
    open(ws) {
      console.log('open', {key: ws.data.key, remoteAddress: ws.remoteAddress});
      ws.send("🎉 Connected!");
    },
    close(ws, code, reason) {
      console.log('close', {key: ws.data.key, remoteAddress: ws.remoteAddress, code, reason});
    },
    message(ws, message) {
      const moduleHash = String(message);
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