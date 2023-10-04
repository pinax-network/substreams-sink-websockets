import { toText } from "./http.js";
import { getSingleMetric } from "./prometheus.js";

export async function checkHealth() {
    if (await getSingleMetric("trace_id") > 0 ) {
        return new Response("OK");
    }
    return toText("Error: No connected webhooks", 400);
};