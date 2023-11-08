import pkg from "../../package.json" assert { type: "json" };

import { OpenApiBuilder } from "openapi3-ts/oas31";
import { registry } from "../prometheus.js";

const TAGS = {
  MONITORING: "Monitoring",
  HEALTH: "Health",
  USAGE: "Usage",
  DOCS: "Documentation",
  FAVICON: "Favicon",
  METRICS: "Metrics",
  MODULEHASH: "ModuleHash",
  MODULEHASHBYCHAIN: "ModuleHashByChain",
  TRACEID: "TraceId",
  CHAIN: "Chain",
  OPENAPI: "OpenAPI",

} as const;

export default new OpenApiBuilder()
  .addInfo({
    title: pkg.name,
    version: pkg.version,
    description: pkg.description,
  })
  .addExternalDocs({ url: pkg.homepage, description: "Extra documentation" })
  .addSecurityScheme("auth-key", { type: "http", scheme: "bearer" })

  .addPath("/favicon.png", {
    get: {
      tags: [TAGS.FAVICON],
      summary: "Endpoint for favicon.png",
      responses: {200: { description: "OK", content: { "image/png": {schema: { type: "string", format: "binary" } } } }},
    },
  })
  .addPath("/health", {
    get: {
      tags: [TAGS.HEALTH],
      summary: "Performs health checks and checks if the database is accessible",
      responses: {200: { description: "OK", content: { "text/plain": {example: "OK"}} } },
    },
  })
  .addPath("/metrics", {
    get: {
      tags: [TAGS.MONITORING],
      summary: "Prometheus metrics",
      responses: {200: { description: "Prometheus metrics", content: { "text/plain": { example: await registry.metrics(), schema: { type: "string" } } }}},
    },
  })
  .addPath("/moduleHash", {
    get: {
      tags: [TAGS.MODULEHASH],
      summary: "Returns module hash",
      responses: {200: { description: "OK", content: { "text/plain": {example: "OK"}} } },
    },
  })
  .addPath("/moduleHashByChain", {
    get: {
      tags: [TAGS.MODULEHASHBYCHAIN],
      summary: "Returns module hash by chain",
      responses: {200: { description: "OK", content: { "text/plain": {example: "OK"}} } },
    },
  })
  .addPath("/traceId", {
    get: {
      tags: [TAGS.TRACEID],
      summary: "Returns traceId",
      responses: {200: { description: "OK", content: { "text/plain": {example: "OK"}} } },
    },
  })
  .addPath("/chain", {
    get: {
      tags: [TAGS.CHAIN],
      summary: "Provides list of available chains",
      responses: {200: { description: "OK", content: { "text/plain": {example: "OK"}} } },
    },
  })
  .addPath("/openapi", {
    get: {
      tags: [TAGS.OPENAPI],
      summary: "OpenAPI specification",
      responses: {200: {description: "OpenAPI JSON Specification", content: { "application/json": { schema: { type: "string" } } } }},
    },
  })
  .getSpecAsJson();