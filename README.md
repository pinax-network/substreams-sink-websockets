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
### `ping` Request

```json
{
    "method": "ping"
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
| GET `/openapi`            | Returns api documentation in JSON format
| GET `/messages`           | Returns the most recent messages
| POST `/` {timestamp, signature, body}   | Webhook HTTP POST (Ed25519 signature)
| POST `/` {"message": "PING"}            | Webhook HTTP POST Ping

## Parameters
### /messages
| Parameter       | Type   | Description                              |
|-----------------|--------|------------------------------------------|
| `chain`         | string | Filter results by chain name, cannot be used with distinct
| `moduleHash`    | string | Filter results by module hash
| `limit`         | int    | Limit number of results shown with a maximum value of 50
| `sort`          | string | Sort by asc (ascending) or desc (descending)
| `distinct`      | bool   | If set to true, will return list of results distinct by chain.

### Example Request
```
/messages?chain=value1&moduleHash=value2&limit=value3&sort=value4
```
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
  --public-key <string>          (required) Ed25519 public key (comma-separated for multiple public keys) (env: PUBLIC_KEY)
  --port <int>                   Server listen on HTTP port (default: 3000, env: PORT)
  --hostname <string>            Server listen on HTTP hostname (default: "0.0.0.0", env: HOSTNAME)
  --sqlite-filename <string>     SQLite database filename (default: "db.sqlite", env: SQLITE_FILENAME)
  --verbose <boolean>            Enable verbose logging (default: false, env: VERBOSE)
  --recent-messages-limit <int>  Limit recent messages (default: 50, env: RECENT_MESSAGES_LIMIT)
  -V, --version                  output the version number
  -h, --help                     display help for command
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

  Bun's latest v1.0 release includes WebSocket support (written in Zig)
  https://bun.sh/docs/api/websockets

  Under the hood, it uses uWebSockets
  https://github.com/uNetworking/uWebSockets