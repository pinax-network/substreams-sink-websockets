import { Server } from "bun";
import { PORT, PUBLIC_KEY } from "./src/config.js";
import { verify } from "./src/verify.js";
import { banner } from "./src/banner.js";

Bun.serve({
  port: PORT,
  async fetch(req: Request, server: Server) {
    if ( req.method == "GET" ) {
      const { pathname } = new URL(req.url);
      if ( pathname === "/") return new Response(banner())
      if ( pathname === "/health") return new Response("OK");
      if ( pathname === "/metrics") return new Response("TO-DO Prometheus metrics");
      return new Response("Not found", { status: 404 });
    }

    // get headers and body from POST request
    if ( req.method == "POST") {
      const timestamp = req.headers.get("x-signature-timestamp");
      const signature = req.headers.get("x-signature-ed25519");
      const body = await req.text();

      if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
      if (!signature) return new Response("missing required signature in headers", { status: 400 });
      if (!body) return new Response("missing body", { status: 400 });

      const isVerified = await verify(body, timestamp, signature, PUBLIC_KEY);
      if (!isVerified) return new Response("invalid request signature", { status: 401 });

      server.publish("message", body);

      // server.upgrade(req, {
      //   data: {
      //     body
      //   },
      // })

      // if (server.upgrade(req)) {
      //   console.log("makes websocket")
      //   return; // do not return a Response
      // }
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