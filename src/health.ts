import { Database } from "bun:sqlite";
import * as sqlite from "./sqlite.js";

export async function checkHealth(db: Database) {
    const total_trace_id = sqlite.findAll(db, "traceId").length;
    if (total_trace_id) return {data: "OK", status: { status: 200 }};
    return {data: "Error: No connected webhooks", status: { status: 400 }};

};