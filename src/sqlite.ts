import Database from "bun:sqlite";
import * as fs from "node:fs";
import * as path from "node:path";

export type KV = {
    timestamp: number,key: string, value: string|number
};

export function createDb(filename: string) {
    // create folder if does not exists
    const {dir} = path.parse(filename);
    if ( dir && !fs.existsSync(dir) ) {
        fs.mkdirSync(dir, {recursive: true});
    }
    const db = new Database(filename, {create: true});

    // create tables if does not exists
    create(db, "moduleHash");
    create(db, "moduleHashByChain");
    create(db, "traceId");
    create(db, "chain");
    createTime(db, "connection");
    createRecent(db, "recentMessages")
    createRecent(db, "recentMessagesByChain")
    return db;
}

export function create(db: Database, table: string) {
    if ( !table ) throw new Error("table is required");
    return db.run(`CREATE TABLE IF NOT EXISTS ${table} (key TEXT PRIMARY KEY, value TEXT)`);
}

export function createTime(db: Database, table: string) {
    if ( !table ) throw new Error("table is required");
    return db.run(`CREATE TABLE IF NOT EXISTS ${table} (key TEXT PRIMARY KEY, value TEXT, timestamp INTEGER)`);
}

export function createRecent(db: Database, table: string) {
    if ( !table ) throw new Error("table is required");
    return db.run(`CREATE TABLE IF NOT EXISTS ${table} (key TEXT PRIMARY KEY, value TEXT, payload TEXT)`);
}

export function replace(db: Database, table: string, key: string, value: string|number) {
    return db.prepare(`REPLACE INTO ${table} (key, value) VALUES (?, ?)`).run(key, value);
}

export function replaceTime(db: Database, table: string, key: string, value: string|number, timestamp: string|number) {
    return db.prepare(`REPLACE INTO ${table} (key, value, timestamp) VALUES (?, ?, ?)`).run(key, value, timestamp);
}

export function replaceRecent(db: Database, table: string, key: string, value: string|number, payload: string|number) {
    return db.prepare(`REPLACE INTO ${table} (key, value, payload) VALUES (?, ?, ?)`).run(key, value, payload);
}


export function selectAll(db: Database, table: string) {
    return db.query(`SELECT * FROM ${table}`).all() as KV[];
}

export function selectAllRecent(db: Database, table: string, distinct: string, order: string, limit: number) {
    return db.query(`SELECT ${distinct} FROM ${table} ORDER BY key ${order} LIMIT ${limit}`).all() as KV[];
}

export function count(db: Database, table: string) {
    const result = db.query(`SELECT COUNT(key) FROM ${table}`).all();
    return result[0]["COUNT(key)"];
}

export function select(db: Database, table: string, key: string) {
    return db.query(`SELECT * FROM ${table} WHERE key=(?) LIMIT 1`).all(key) as KV[];
}

export function exists(db: Database, table: string, key: string ) {
    return select(db, table, key).length > 0;
}

export function increment(db: Database, table: string, key: string, value: number, timestamp: number) {
    if ( exists(db, table, key) ) {
        return db.prepare(`UPDATE ${table} SET value = value + ?, timestamp = ? WHERE key = ?`).run(value, timestamp, key);
    }
    return db.prepare(`REPLACE INTO ${table} (key, value, timestamp) VALUES (?, ?, ?)`).run(key, value, timestamp);
}

export function deleteRow(db: Database, table: string, key: string) {
    return db.prepare(`DELETE FROM ${table} WHERE key = ?`).run(key);
}



// TO-DO: UPDATE (increment/decrement)
// UPDATE product SET price = price + 50 WHERE id = 1
// UPDATE {table} SET {column} = {column} + {value} WHERE {condition}