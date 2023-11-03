import pkg from "../../package.json" assert { type: "json" };

import { OpenApiBuilder, SchemaObject, ExampleObject, ParameterObject } from "openapi3-ts/oas31";
import { config } from "../config.js";
import { getBlock } from "../queries.js";
import { registry } from "../prometheus.js";
import { makeQuery } from "../clickhouse/makeQuery.js";
import { supportedChainsQuery } from "./chains.js";

const TAGS = {
  MONITORING: "Monitoring",
  HEALTH: "Health",
  USAGE: "Usage",
  DOCS: "Documentation",
} as const;

const chains = await supportedChainsQuery();
const block_example = (await makeQuery(await getBlock( new URLSearchParams({limit: "2"})))).data;

const timestampSchema: SchemaObject = { anyOf: [
    {type: "number"},
    {type: "string", format: "date"},
    {type: "string", format: "date-time"}
  ]
};
const timestampExamples: ExampleObject = {
  unix: { summary: `Unix Timestamp (seconds)` },
  date: { summary: `Full-date notation`, value: '2023-10-18' },
  datetime: { summary: `Date-time notation`, value: '2023-10-18T00:00:00Z'},
}

export default new OpenApiBuilder()
  .addInfo({
    title: pkg.name,
    version: pkg.version,
    description: pkg.description,
    license: {name: pkg.license},
  })
  .addExternalDocs({ url: pkg.homepage, description: "Extra documentation" })
  .addSecurityScheme("auth-key", { type: "http", scheme: "bearer" })
  .addPath("/chains", {
    get: {
      tags: [TAGS.USAGE],
      summary: 'Supported chains',
      responses: {
        200: {
          description: "Array of chains",
          content: {
            "application/json": {
              schema: { type: "array" },
              example: chains,
            }
          },
        },
      },
    },
  })
  .addPath("/block", {
    get: {
      tags: [TAGS.USAGE],
      summary: "Get block",
      description: "Get block by `block_number`, `block_id` or `timestamp`",
      parameters: [
        {
          name: "chain",
          in: "query",
          description: "Filter by chain",
          required: false,
          schema: {enum: chains},
        },
        {
          name: "block_number",
          description: "Filter by Block number (ex: 18399498)",
          in: "query",
          required: false,
          schema: { type: "number" },
        },
        {
          name: "block_id",
          in: "query",
          description: "Filter by Block hash ID (ex: 00fef8cf2a2c73266f7c0b71fb5762f9a36419e51a7c05b0e82f9e3bacb859bc)",
          required: false,
          schema: { type: "string" },
        },
        {
          name: 'timestamp',
          in: 'query',
          description: 'Filter by exact timestamp',
          required: false,
          schema: timestampSchema,
          examples: timestampExamples,
        },
        {
          name: "final_block",
          description: "If true, only returns final blocks",
          in: "query",
          required: false,
          schema: { type: "boolean" },
        },
        {
          name: "sort_by",
          in: "query",
          description: "Sort by `block_number`",
          required: false,
          schema: {enum: ['ASC', 'DESC'] },
        },
        ...["greater_or_equals_by_timestamp", "greater_by_timestamp", "less_or_equals_by_timestamp", "less_by_timestamp"].map(name => {
          return {
            name,
            in: "query",
            description: "Filter " + name.replace(/_/g, " "),
            required: false,
            schema: timestampSchema,
            examples: timestampExamples,
          } as ParameterObject
        }),
        ...["greater_or_equals_by_block_number", "greater_by_block_number", "less_or_equals_by_block_number", "less_by_block_number"].map(name => {
          return {
            name,
            in: "query",
            description: "Filter " + name.replace(/_/g, " "),
            required: false,
            schema: { type: "number" },
          } as ParameterObject
        }),
        {
          name: "limit",
          in: "query",
          description: "Used to specify the number of records to return.",
          required: false,
          schema: { type: "number", maximum: config.maxLimit, minimum: 1 },
        },
      ],
      responses: {
        200: { description: "Array of blocks", content: { "application/json": { example: block_example, schema: { type: "array" } } } },
        400: { description: "Bad request" },
      },
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
  .addPath("/openapi", {
    get: {
      tags: [TAGS.DOCS],
      summary: "OpenAPI specification",
      responses: {200: {description: "OpenAPI JSON Specification", content: { "application/json": { schema: { type: "string" } } } }},
    },
  })
  .getSpecAsJson();