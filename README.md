# [`Substreams`](https://substreams.streamingfast.io/) Sink WebSockets

> `substreams-sink-websockets` is a tool that allows developers to pipe data extracted from a blockchain to WebSockets.

## Requirements

- [Substreams Sink Webhook](https://github.com/pinax-network/substreams-sink-webhook)

## Quickstart

```bash
$ bun install
$ bun dev
```

## [`Bun` Binary Releases](https://github.com/pinax-network/substreams-sink-websockets/releases)

> Linux Only

```
$ wget https://github.com/pinax-network/substreams-sink-websockets/releases/download/v0.1.5/substreams-sink-websockets
$ chmod +x ./substreams-sink-websockets
```

## Docker environment

Pull from GitHub Container registry
```bash
docker pull ghcr.io/pinax-network/substreams-sink-websockets:latest
```

Build from source
```bash
docker build -t substreams-sink-websockets .
```

Run with `.env` file
```bash
docker run -it --rm --env-file .env ghcr.io/pinax-network/substreams-sink-websockets
```

## `.env` Environment variables

```env
PORT=3000
PUBLIC_KEY=...
```

## Standalone Bun executable

https://github.com/pinax-network/substreams-sink-websockets/releases

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- [Bun WebSockets](https://bun.sh/docs/api/websockets)

## Features

- [x] Accept Substreams Webhook message `POST /`
- [x] Client connect to WebSocket service
- [x] Verify tweetnacl Substreams Webhook message
- [x] Send WebSocket messages
- [x] Unit testing
- [x] Prometheus Metrics `GET /metrics`
- [x] Health check `GET /health`
- [x] Banner `GET /`
- [ ] Commander CLI
