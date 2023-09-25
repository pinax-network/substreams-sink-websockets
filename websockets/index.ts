const server = Bun.serve({
    fetch(req, server) {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
      return new Response("Upgrade failed :(", { status: 500 });
    },
    websocket: {
      open(ws) {
        console.log("A new client connected!");
      },
        message(ws, message) {
          console.log(message);
          ws.send("Hello from the server!");
        }
    }, // handlers
  });

  console.log(`Listening on http://localhost:${server.port} ...`);