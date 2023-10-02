import { expect, test } from "bun:test";
import * as sqlite from "./sqlite.js";
import Database from "bun:sqlite";

const db = new Database(":memory:", {create: true});

test("create", async () => {
    await sqlite.create(db, "moduleHash");
});

test("replace", async () => {
    await sqlite.replace(db, "moduleHash", "foo", "bar");
    await sqlite.replace(db, "moduleHash", "hello", "world");
});

test("find", async () => {
    const result = await sqlite.select(db, "moduleHash", "foo");
    expect(result[0].key).toBe("foo");
    expect(result[0].value).toBe("bar");
});

test("selectAll", async () => {
    const result = await sqlite.selectAll(db, "moduleHash");
    expect(result.length).toBe(2);
});

test("count", async () => {
    const result = await sqlite.count(db, "moduleHash");
    expect(result).toBe(2);
});

test("exists", async () => {
    expect(await sqlite.exists(db, "moduleHash", "foo")).toBeTruthy();
    expect(await sqlite.exists(db, "moduleHash", "not exists")).toBeFalsy();
});
