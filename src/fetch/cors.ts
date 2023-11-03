import { BunFile } from "bun";

export const CORS_HEADERS = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, WWW-Authenticate",
});
export const JSON_HEADERS = new Headers({"Content-Type": "application/json"});
export const TEXT_HEADERS = new Headers({"Content-Type": "text/plain; version=0.0.4; charset=utf-8"});

export function appendHeaders(...args: Headers[]) {
    const headers = new Headers(CORS_HEADERS); // CORS as default headers
    for (const arg of args) {
        for (const [key, value] of arg.entries()) {
            headers.set(key, value);
        }
    }
    return headers;
};

export function toJSON(body: any, status = 200, headers = new Headers()) {
    const data = typeof body == "string" ? body : JSON.stringify(body, null, 2);
    return new Response(data, { status, headers: appendHeaders(JSON_HEADERS, headers) });
}

export function toText(body: string, status = 200, headers = new Headers()) {
    return new Response(body, { status, headers: appendHeaders(TEXT_HEADERS, headers) });
}

export function toFile(body: BunFile, status = 200, headers = new Headers()) {
    const fileHeaders = new Headers({"Content-Type": body.type});
    return new Response(body, { status, headers: appendHeaders(fileHeaders, headers) });
}

export const BadRequest = toText('Bad Request', 400);
export const NotFound = toText('Not Found', 404);
export const InternalServerError = toText("Internal Server Error", 500);