# [`Substreams`](https://substreams.streamingfast.io/) Sink WebSockets

> `substreams-sink-websockets` is a tool that allows developers to pipe data extracted from a blockchain to WebSockets.

## Requirements

- [Substreams Sink Webhook](https://github.com/pinax-network/substreams-sink-webhook)

## Quickstart

```bash
$ bunx substreams-sink-websockets
```

## `.env` Environment variables

```env
PORT=3000
PUBLIC_KEY=...
```

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
