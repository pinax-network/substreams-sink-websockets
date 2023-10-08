export function parseMessage(message: string|Buffer): { method: string, id: string, params: {[key: string]: any} } {
    // validate if message is JSON
    let json: any;
    try {
        json = JSON.parse(message.toString());
    } catch (error) {
        throw new Error("Invalid JSON message");
    }
    const { method } = json;
    if ( method === null || method === undefined) throw new Error('Missing required \'method\' in JSON request.');
    return json;
}
