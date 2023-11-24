import { toText } from "./cors.js";

// https://github.com/pinax-network/substreams-sink-websockets/issues/2#issuecomment-1746121519
export function checkHealth() {
    return toText("OK");
};