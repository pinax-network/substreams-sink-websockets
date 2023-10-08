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
export const webhook_trace_id = registerCounter('trace_id', 'Total Webhook Substreams trace ids', ['traceId', 'chain']);

// WebSocket metrics
export const active_connections = registerGauge('active_connections', 'All WebSocket active connections');
export const connected = registerCounter('connected', 'Total WebSocket connected clients');
export const disconnects = registerCounter('disconnects', 'Total WebSocket disconnects');
export const published_messages = registerCounter('published_messages', 'Total WebSocket published messages');
export const published_messages_bytes = registerCounter('published_messages_bytes', 'Total WebSocket  published messages in bytes');
export const received_message = registerCounter('received_messages', 'Total WebSocket messages received', ['method']);
export const received_message_errors = registerCounter('received_messages_errors', 'Total WebSocket errors from messages received');