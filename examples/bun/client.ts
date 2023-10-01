const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("Connected!");
    ws.send("6aa24e6aa34db4a4faf55c69c6f612aeb06053c2")
};

ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};