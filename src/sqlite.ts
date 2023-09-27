function create(db: any){
    db.query(`create table if not exists data (moduleHash text primary key)`).run();
}

export function insert(db: any, moduleHash: string){
    create(db)
    return db.query("insert or ignore into data (moduleHash) values (?)").all(moduleHash);
}

export function select(db: any){
    create(db)
    return db.query("select modulehash from data").all();
}