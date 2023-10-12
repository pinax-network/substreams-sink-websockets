import { randomUUID } from "crypto";

let payload: Array<String> = []
export async function websocketClient(url: string, searchParams: URLSearchParams){
    const ws = new WebSocket(url);
    let moduleHash = ""

    if (!searchParams.has("moduleHash")) throw new Error("moduleHash is required")

    if (!searchParams.has("chain")) moduleHash = searchParams.get("moduleHash")
    if (searchParams.has("chain")) moduleHash = `${searchParams.get("chain")}:${searchParams.get("moduleHash")}`;

    ws.onopen = () => {
        console.log("connected");
        ws.send(JSON.stringify({
            id: randomUUID(),
            method: "subscribe",
            params: {
                moduleHash: moduleHash
            }
        }));
    };

    ws.onmessage = (event) => {
        payload.push(String(event.data))
    };

    return payload
}