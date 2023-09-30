FROM oven/bun
COPY . .
RUN bun install
ENTRYPOINT [ "bun", "./index.ts" ]