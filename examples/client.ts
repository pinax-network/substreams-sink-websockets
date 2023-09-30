const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (ws) => {
    console.log("Connected!");
    socket.send("6aa24e6aa34db4a4faf55c69c6f612aeb06053c2")
};

socket.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};
