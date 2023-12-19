import { expect, test } from "bun:test";
import * as sqlite from "./sqlite.js";
import Database from "bun:sqlite";

const db = new Database(":memory:", {create: true});

test("create", async () => {
    await sqlite.create(db, "moduleHash");
    await sqlite.create(db, "messages", "payload TEXT");
    await sqlite.create(db, "messagesByChain", "payload TEXT");
});

test("replace", async () => {
    await sqlite.replace(db, "moduleHash", "foo", "bar");
    await sqlite.replace(db, "moduleHash", "hello", "world");
    await sqlite.replace(db, "messages", String(Date.now()), "moduleHash", "payload", "text");
    await sqlite.replace(db, "messagesByChain", String(Date.now()), `${"chain"}:${"moduleHash"}`, "payload", "text");
});

test("find", async () => {
    const result = await sqlite.select(db, "moduleHash", "foo");
    expect(result[0].key).toBe("foo");
    expect(result[0].value).toBe("bar");
});

test("selectAll", async () => {
    const result = await sqlite.selectAll(db, "moduleHash");
    expect(result.length).toBe(2);
    const result2 = await sqlite.selectAll(db, "messages", "*", "DESC", 1);
    expect (result2.length).toBe(1);
    const result3 = await sqlite.selectAll(db, "messagesByChain", `*`, "DESC", 1);
    expect (result3.length).toBe(1);
});

test("count", async () => {
    const result = await sqlite.count(db, "moduleHash");
    expect(result).toBe(2);
});

test("exists", async () => {
    expect(await sqlite.exists(db, "moduleHash", "foo")).toBeTruthy();
    expect(await sqlite.exists(db, "moduleHash", "not exists")).toBeFalsy();
});

test("select", async () => {
    const result = await sqlite.select(db, "moduleHash", "foo");
    expect(result[0].key).toBe("foo");
    expect(result[0].value).toBe("bar");
});

test("delete", async () => {
    await sqlite.deleteRow(db, "moduleHash", "foo");
    const result = await sqlite.select(db, "moduleHash", "foo");
    expect(result.length).toBe(0);
});