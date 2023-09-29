import * as prometheus from "./prometheus.js";
import { Database } from "bun:sqlite";
import { select } from "./sqlite.js";

export async function checkHealth(){
    const traces = new Database("./sqlite/sessionId.sqlite");
    const session = select(traces, "sessionId").length
    const messages = await prometheus.getSingleMetric(`total_webhooks_sessions`)

    if (messages || session) return {data: "OK", status: { status: 200 }};
    return {data: "Error: No connected webhooks", status: { status: 400 }};

};