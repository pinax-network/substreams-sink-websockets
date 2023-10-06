# [`Substreams`](https://substreams.streamingfast.io/) Service WebSockets

> `substreams-service-websockets` is a tool that allows developers to pipe data extracted from a blockchain to WebSockets.

## Quickstart

```bash
$ bun install
$ bun run dev
```

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- [Bun WebSockets](https://bun.sh/docs/api/websockets)


## `.env` Environment variables

```env
PORT=3000
PUBLIC_KEY=...
```

## Help

```
$ substreams-service-websockets --help

TO-DO...
```

## Features

- [x] Accept Substreams Webhook message `POST /`
- [ ] Client connect to WebSocket service
- [x] Verify tweetnacl Substreams Webhook message
- [ ] Send WebSocket messages
- [ ] Unit testing
- [ ] Prometheus Metrics `GET /metrics`
- [ ] Health check `GET /health`
- [x] Banner `GET /`
- [ ] Commander CLI
