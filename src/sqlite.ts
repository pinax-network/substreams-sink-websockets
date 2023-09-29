function create(db: any, column: string){
    console.log(column)
    db.query(`create table if not exists data (${column} text primary key)`).run();
}

export function insert(db: any, data: string, column: string){
    create(db, column)
    console.log(column)
    return db.query(`insert or ignore into data (${column}) values (?)`).all(data);
}

export function select(db: any, column: string){
    create(db, column)
    return db.query(`select ${column} from data`).all();
}