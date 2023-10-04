export function parseMessage(message: string|Buffer): {id: string, method: string, params: any } {
    try {
        const json = JSON.parse(message.toString());
        return json;
    } catch (error) {
        return {id: null, method: null, params: {}};
    }
}