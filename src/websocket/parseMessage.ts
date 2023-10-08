export function parseMessage(message: string|Buffer): { method: string, id: string, params: {[key: string]: any} } {
    // validate if message is JSON
    let json: any;
    try {
        json = JSON.parse(message.toString());
    } catch (error) {
        throw new Error("Invalid JSON message");
    }
    const { method, params } = json;
    if ( method === null || method === undefined) throw new Error('Missing required \'method\' in JSON request.');

    if ( method === 'subscribe' ) {
        if ( params === null || params === undefined) throw new Error('Missing required \'params\' in JSON request.');
        const { moduleHash } = params;
        if ( moduleHash === null || moduleHash === undefined) throw new Error('Missing required \'moduleHash\' in JSON request.');
    }

    return json;
}
