import Database from "bun:sqlite";

export function create(db: Database, table: string) {
    return db.query(`CREATE TABLE IF NOT EXISTS ${table} (key TEXT PRIMARY KEY, value TEXT)`).run();
}

export function insert(db: Database, table: string, key: string, value: string|number) {
    return db.query(`INSERT OR REPLACE INTO ${table} (key, value) values (?, ?)`).all(key, value);
}

export function findAll(db: Database, table: string) {
    return db.query(`SELECT * from ${table}`).all();
}

export function find(db: Database, table: string, key: string) {
    return db.query(`SELECT * from ${table} WHERE key=${key}`).all();
}
