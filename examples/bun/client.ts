import "dotenv/config"
const ws = new WebSocket("ws://localhost:3000");

const MODULEHASH = String(process.env.MODULEHASH);

ws.onopen = () => {
    console.log("Connected!");
    ws.send(MODULEHASH)
};

ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};