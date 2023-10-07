export function toText(data: any, status = 200) {
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' };
    return new Response(data, { status, headers });
}

export function toJSON(data: any, status = 200) {
    const body = JSON.stringify(data, null, 2);
    const headers = { 'Content-Type': 'application/json' };
    return new Response(body, { status, headers });
}