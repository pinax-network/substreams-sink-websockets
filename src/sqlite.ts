import Database from "bun:sqlite";

export type KV = {key: string, value: string|number};

export function create(db: Database, table: string) {
    if ( !table ) throw new Error("table is required");
    return db.run(`CREATE TABLE IF NOT EXISTS ${table} (key TEXT PRIMARY KEY, value TEXT)`);
}

export function replace(db: Database, table: string, key: string, value: string|number) {
    return db.prepare(`REPLACE INTO ${table} (key, value) VALUES (?, ?)`).run(key, value);
}

export function selectAll(db: Database, table: string) {
    return db.query(`SELECT * FROM ${table}`).all() as KV[];
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

// TO-DO: UPDATE
// UPDATE product SET price = price + 50 WHERE id = 1
// UPDATE {table} SET {column} = {column} + {value} WHERE {condition}