const messages = document.querySelector("#messages");
const send = document.querySelector("#send");
const message = document.querySelector("#message");

const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("Connected!");
    ws.send("90a60a0dccc4ba24b84f93fb777af45cd7a70350");
};

ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
    messages.innerHTML += `<li>${event.data}</li>`;
};

send.addEventListener("click", () => {
    ws.send(message.value)
})
