import client, { Counter, CounterConfiguration, Gauge, GaugeConfiguration } from 'prom-client';
import { logger } from './logger.js';

export const registry = new client.Registry();

// Metrics
export function registerCounter(name: string, help = "help", labelNames: string[] = [], config?: CounterConfiguration<string>): Counter | undefined {
    try {
        registry.registerMetric(new Counter({ name, help, labelNames, ...config }));
        return registry.getSingleMetric(name) as Counter;
    } catch (e) {
        logger.error(e);
    }
}

export function registerGauge(name: string, help = "help", labelNames: string[] = [], config?: GaugeConfiguration<string>): Gauge | undefined {
    try {
        registry.registerMetric(new Gauge({ name, help, labelNames, ...config }));
        return registry.getSingleMetric(name) as Gauge;
    } catch (e) {
        logger.error(e);
    }
}

export async function getSingleMetric(name: string) {
    const metric = registry.getSingleMetric(name);
    const get = await metric?.get();
    return get?.values[0].value;
}

// Webhook metrics
export const webhook_messages = registerCounter('webhook_messages', 'Total Webhook messages received', ['moduleHash', 'chain']);
export const trace_id = registerGauge('trace_id', 'Total trace ids', ['traceId']);

// WebSocket metrics
export const active_connections = registerGauge('active_connections', 'All active connections');
export const connected = registerCounter('connected', 'Total connected clients');
export const published_messages = registerCounter('published_messages', 'Total published messages');
export const bytes_published = registerCounter('bytes_published', 'Total bytes published');
export const disconnects = registerCounter('disconnects', 'Total disconnects');
export const pings = registerCounter('pings', 'Total pings');