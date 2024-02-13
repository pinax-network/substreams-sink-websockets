import { expect, test } from "bun:test";
import { parseMessage } from "./parseMessage.js";

test("parseMessage - subscribe to ModuleHash by Chain", () => {
    expect(parseMessage(`{
        "method": "subscribe",
        "params": {
            "chain": "bsc",
            "moduleHash": "0a363b2a63aadb76a525208f1973531d3616fbae"
        }
    }`)).toBeTruthy();
});

test("parseMessage - subscribe to ModuleHash", () => {
    expect(parseMessage(`{
        "method": "subscribe",
        "params": {
            "moduleHash": "0a363b2a63aadb76a525208f1973531d3616fbae"
        }
    }`)).toBeTruthy();
});

test("parseMessage - Missing required 'params' in JSON request.", () => {
    expect(() => parseMessage(`{
        "method": "subscribe"
    }`)).toThrow("Missing required 'params' in JSON request.");
});

test("parseMessage - ping", () => {
    expect(parseMessage(`{
        "method": "ping"
    }`)).toBeTruthy();

    expect(Number(parseMessage(`{
        "id": 123,
        "method": "ping"
    }`).id)).toBe(123);
});

test("parseMessage - time", () => {
    expect(parseMessage(`{
        "method": "time"
    }`)).toBeTruthy();

    expect(Number(parseMessage(`{
        "id": 123,
        "method": "time"
    }`).id)).toBe(123);
});

test("parseMessage - Missing required 'method' in JSON request.", () => {
    expect(() => parseMessage(`{
        "foo": "bar"
    }`)).toThrow("Missing required 'method' in JSON request.");
});