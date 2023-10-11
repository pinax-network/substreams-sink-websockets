const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("connected");
    ws.send(JSON.stringify({ method: "ping" }));
};

ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};