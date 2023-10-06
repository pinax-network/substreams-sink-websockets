import { randomUUID } from "crypto";

const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("connected");
    ws.send(JSON.stringify({
        id: randomUUID(),
        method: "time"
    }));
};

ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};