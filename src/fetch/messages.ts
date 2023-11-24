import * as sqlite from "../sqlite.js";
import { RECENT_MESSAGES_LIMIT } from "../config.js";
import { toJSON } from "../http.js";
import Database from "bun:sqlite";

export function insertMessages(db: Database, traceId: string, timestamp: string, chain?: string) {
    const dbLength = sqlite.count(db, "messages");

    if (dbLength >= RECENT_MESSAGES_LIMIT) {
        let oldest = sqlite.selectAll(db, "messages").sort((a: any, b: any) => a.timestamp - b.timestamp)[0];
        console.log("oldest", oldest)

        // update messages
        sqlite.replaceRecent(db, "messages", String(Date.now()), `${traceId}`, timestamp);
        sqlite.deleteRow(db, "messages", oldest.key);

        // update messagesByChain
        if (chain) {
            oldest = sqlite.selectAll(db, "messagesByChain").sort((a: any, b: any) => a.timestamp - b.timestamp)[0];
            console.log(oldest)
            sqlite.replaceRecent(db, "messagesByChain", String(Date.now()), `${chain}:${traceId}`, timestamp );
            sqlite.deleteRow(db, "messagesByChain", `${oldest.key}`);
        }
        return;
    }
    // add messages if tables not full
    sqlite.replaceRecent(db, "messages", String(Date.now()), `${traceId}`, timestamp);

    if (chain) sqlite.replaceRecent(db, "messagesByChain", String(Date.now()), `${chain}:${traceId}`, timestamp );
}

export function selectMessages(db: Database, chain?: string, moduleHash?: string, limit?: number, distinct?: string, sortBy?: string) {

    let messages = sqlite.selectAllRecent(db,  "messages", "*", sortBy, limit);

    if (distinct) messages = selectDistinct(distinct, messages, db, chain, sortBy, limit);
    if (chain) messages = sqlite.selectAllRecent(db, "messagesByChain", "*", sortBy, limit).filter((message: any) => message.value.includes(chain));
    if (moduleHash) messages = messages.filter((message: any) => message.value.includes(moduleHash));

    return toJSON(messages);
}

export function selectDistinct(distinct?: string, messages?: any, db?: any, chain?: string, sortBy?: string, limit?: number) {
    let chainList = sqlite.selectAll(db, "chain");
    if (distinct === "true") {

    let distinctChain = [];
        for (let i = 0; i < chainList.length; i++) {
            let chainName = chainList[i].key;

            messages = sqlite.selectAllRecent(db, "messagesByChain", "*", sortBy, limit)
            messages = messages.filter((message: any) => message.value.includes(chainName));

            distinctChain.push(messages[0]);
            chainList.slice(i, 1);
        }
        let result = distinctChain.filter((notNull) => notNull !== undefined)
        return result;
    }
    return;
}
