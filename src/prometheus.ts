import client, {Counter, Gauge} from 'prom-client';

export const register = new client.Registry();


export function registerCounter(name: string, help: string) {
    try {
        register.registerMetric( new client.Counter({ name, help }));
        return register.getSingleMetric(name) as Counter;
    } catch (error) {
    }
}

export function registerGauge(name: string, help: string) {
    try {
        register.registerMetric( new client.Gauge({ name, help }));
        return register.getSingleMetric(name) as Gauge;
    } catch (error) {
    }
}

export const activeConnections = registerGauge('active_connections', 'All active connections');
export const connected = registerCounter('connected', 'Total connected clients');
export const publishedMessages = registerCounter('published_messages', 'Total published messages');
export const bytesPublished = registerCounter('bytes_published', 'Total bytes published');
export const disconnects = registerCounter('disconnects', 'Total disconnects');

export const registry = await register.metrics();