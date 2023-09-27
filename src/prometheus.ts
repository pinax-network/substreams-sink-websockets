import client, { Counter, Gauge } from 'prom-client';

export const registry = new client.Registry();
export { client };