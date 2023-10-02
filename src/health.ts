import { Database } from "bun:sqlite";
import * as sqlite from "./sqlite.js";

export async function checkHealth(db: Database) {
    const total_trace_id = sqlite.selectAll(db, "traceId").length;
    console.log('total_trace_id', total_trace_id)
    if (total_trace_id) return {data: "OK", status: { status: 200 }};
    return {data: "Error: No connected webhooks", status: { status: 400 }};

};