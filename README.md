# [`Substreams`](https://substreams.streamingfast.io/) Sink WebSockets

> `substreams-sink-websockets` is a tool that allows developers to pipe data extracted from a blockchain to WebSockets.

## WebSockets API

| Method      | Params                | Description
|-------------|-----------------------| ----------------------|
| `ping`      |                       | Test connectivity to the WebSocket API.
| `time`      |                       | Get the current server time to the WebSocket API.
| `subscribe` | `{chain, moduleHash}` | Subscribe to a Substreams module hash by chain.

Send Text Message with the following JSON payloads

### `subscribe` Request

```json
{
    "method": "subscribe",
    "params": {
        "chain": "bsc",
        "moduleHash": "0a363b2a63aadb76a525208f1973531d3616fbae"
    }
}
```

## REST API

| Pathname                  | Description           |
|---------------------------|-----------------------|
| GET `/health`             | Health check
| GET `/metrics`            | Prometheus metrics
| GET `/chain`              | Returns all available `chain`
| GET `/traceId`            | Returns all `traceId` by `chain`
| GET `/moduleHash`         | Returns all available `moduleHash`
| GET `/moduleHashByChain`  | Returns all available `moduleHash` by `chain`
| POST `/` {timestamp, signature, body}   | Webhook HTTP POST (Ed25519 signature)
| POST `/` {"message": "PING"}            | Webhook HTTP POST Ping

## WebSockets examples

- [`Bun`](/examples/bun) - https://bun.sh/
- [React Native](/examples/react-native) - https://expo.dev/
- [HTML](/examples/html)
- [HTTP POST requests](/examples/post-http)

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

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- [Bun WebSockets](https://bun.sh/docs/api/websockets)