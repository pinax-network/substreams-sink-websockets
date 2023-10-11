const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("connected");
    ws.send(JSON.stringify({
        method: "subscribe",
        params: {
            moduleHash: "0a363b2a63aadb76a525208f1973531d3616fbae"
        }
    }));
};

ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};