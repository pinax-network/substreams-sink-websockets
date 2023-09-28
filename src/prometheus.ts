import client from 'prom-client';

export const register = new client.Registry();

function registerCounter(name: string, help: string) {
    try {
        const counter = new client.Counter({ name, help });
        register.registerMetric(counter);
        console.log(`Counter '${name}' registered`);
        return counter;
    } catch (error) {
    }
}

function registerGauge(name: string, help: string) {
    try {
        const gauge = new client.Gauge({ name, help });
        register.registerMetric(gauge);
        console.log(`Gauge '${name}' registered`);
        return gauge;
    } catch (error) {
    }
}

export const activeConnections = registerGauge('active_connections', 'All active connections');
export const connected = registerCounter('connected', 'Total connected clients');
export const publishedMessages = registerCounter('published_messages', 'Total published messages');
export const bytesPublished = registerCounter('bytes_published', 'Total bytes published');
export const disconnects = registerCounter('disconnects', 'Total disconnects');

export const registry = register
