import { Server } from "bun";
import { PORT, PUBLIC_KEY } from "./src/config.js";
import { verify } from "./src/verify.js";
import { banner } from "./src/banner.js";

console.log(`Server listening on PORT http://localhost:${PORT}`);
console.log("Verifying with PUBLIC_KEY", PUBLIC_KEY);

Bun.serve({
  port: PORT,
  async fetch(req: Request, server: Server) {
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
      console.log(`server.publish message (block=${clock.number}, moduleHash=${moduleHash})`); // to remove
      server.publish("message", body);

      return new Response("OK");
    }
    return new Response("Invalid request", { status: 400 });
  },
  websocket: {
    open(ws) {
      console.log(`${ws.remoteAddress} client connected`);
    },
    message(ws, message) {
      // console.log(ws.data.body)
      // ws.send(ws.data.body);
    },
  },
});