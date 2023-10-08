import client, { Counter, CounterConfiguration, Gauge, GaugeConfiguration } from 'prom-client';
import { logger } from './logger.js';

export const registry = new client.Registry();

// Metrics
export function registerCounter(name: string, help = "help", labelNames: string[] = [], config?: CounterConfiguration<string>): Counter | undefined {
    try {
        registry.registerMetric(new Counter({ name, help, labelNames, ...config }));
        return registry.getSingleMetric(name) as Counter;
    } catch (e) {
        logger.error({name, e});
    }
}

export function registerGauge(name: string, help = "help", labelNames: string[] = [], config?: GaugeConfiguration<string>): Gauge | undefined {
    try {
        registry.registerMetric(new Gauge({ name, help, labelNames, ...config }));
        return registry.getSingleMetric(name) as Gauge;
    } catch (e) {
        logger.error({name, e});
    }
}

export async function getSingleMetric(name: string) {
    const metric = registry.getSingleMetric(name);
    const get = await metric?.get();
    return get?.values[0].value;
}

// Webhook metrics
export const webhook_trace_id = registerCounter('trace_id', 'Total Webhook Substreams trace ids', ['traceId', 'chain']);
export const webhook_message_received = registerCounter('webhook_message_received', 'Total Webhook messages received', ['moduleHash', 'chain']);
export const webhook_message_received_errors = registerCounter('webhook_message_received_errors', 'Total Webhook errors from messages received');

// WebSocket metrics
export const connection_active = registerGauge('connection_active', 'Total WebSocket active connections');
export const connection_open = registerCounter('connection_open', 'Total WebSocket open connections');
export const connection_close = registerCounter('connection_close', 'Total WebSocket close connections');

export const publish_message = registerCounter('publish_message', 'Total WebSocket published messages');
export const publish_message_bytes = registerCounter('publish_message_bytes', 'Total WebSocket  published messages in bytes');

export const message_received = registerCounter('message_received', 'Total WebSocket messages received', ['method']);
export const message_received_errors = registerCounter('message_received_errors', 'Total WebSocket errors from messages received');