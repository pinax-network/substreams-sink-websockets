# [`Substreams`](https://substreams.streamingfast.io/) Sink WebSockets

> `substreams-sink-websockets` is a tool that allows developers to pipe data extracted from a blockchain to WebSockets.

## WebSockets examples

- [`Bun`](/examples/bun) - https://bun.sh/
- [React Native](/examples/react-native) - https://expo.dev/
- [HTML](/examples/html)
- [HTTP POST requests](/examples/post-http)

## Requirements

- [Substreams Sink Webhook](https://github.com/pinax-network/substreams-sink-webhook)

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- [Bun WebSockets](https://bun.sh/docs/api/websockets)

## Quickstart

```bash
$ bun install
$ bun dev
```

## [`Bun` Binary Releases](https://github.com/pinax-network/substreams-sink-websockets/releases)

> Linux Only

```
$ wget https://github.com/pinax-network/substreams-sink-websockets/releases/download/v0.1.7/substreams-sink-websockets
$ chmod +x ./substreams-sink-websockets
```

## `.env` Environment variables

```env
# required
PUBLIC_KEY="<Ed25519 public key>"

# optional
PORT=3000
SQLITE_FILENAME=db.sqlite
HOSTNAME=0.0.0.0
VERBOSE=true
```

## Help

```bash
$ substreams-sink-websockets --help

Usage: substreams-sink-websockets [options]

Substreams Sink Websockets

Options:
  --public-key <string>       (required) Ed25519 public key (env: PUBLIC_KEY)
  --port <int>                Server listen on HTTP port (default: 3000, env: PORT)
  --hostname <string>         Server listen on HTTP hostname (default: "0.0.0.0", env: HOSTNAME)
  --sqlite-filename <string>  SQLite database filename (default: "db.sqlite", env: SQLITE_FILENAME)
  --verbose <boolean>         Enable verbose logging (default: false, env: VERBOSE)
  -V, --version               output the version number
  -h, --help                  display help for command
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
