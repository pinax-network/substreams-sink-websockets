import * as prometheus from "./prometheus.js";

export async function checkHealth(){
    const messages = await prometheus.getSingleMetric(`total_webhooks_sessions`)
    console.log(messages)
    if (messages) return {data: "OK", status: { status: 200 }};
    return {data: "Error: No connected webhooks", status: { status: 400 }};

};