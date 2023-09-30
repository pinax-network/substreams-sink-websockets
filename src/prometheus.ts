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

export async function customMetric(moduleHash: string) {
    const name = `webhook_hash_${moduleHash}`;
    const help = `Individual webhook session`;
    try {
        const gauge = new client.Gauge({ name, help });
        register.registerMetric(gauge);
        console.log(`Gauge '${name}' registered`);
        if (await getSingleMetric(name) == 0) {
            totalWebhooks.inc(1);
            gauge.inc(1);
        }
        return gauge;
    } catch (error) {
    }
}

export async function getSingleMetric(name: string) {
    const metric = registry.getSingleMetric(name);
    const get = await metric?.get();
    return get?.values[0].value;
}

export const activeConnections = registerGauge('active_connections', 'All active connections');
export const totalWebhooks = registerGauge('total_webhooks_sessions', 'Total webhook sessions');
export const connected = registerCounter('connected', 'Total connected clients');
export const publishedMessages = registerCounter('published_messages', 'Total published messages');
export const bytesPublished = registerCounter('bytes_published', 'Total bytes published');
export const disconnects = registerCounter('disconnects', 'Total disconnects');

export const registry = register
