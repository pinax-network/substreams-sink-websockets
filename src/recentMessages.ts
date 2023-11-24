import * as sqlite from "../src/sqlite.js";
import { RECENT_MESSAGES_LIMIT } from "./config.js";
import { toJSON, toText } from "./http.js";

export function recentMessages(db: any, traceId: string, timestamp: string, chain?: string) {
    const dbLength = sqlite.count(db, "recentMessages");

    if (dbLength >= RECENT_MESSAGES_LIMIT) {
        let oldest = sqlite.selectAll(db, "recentMessages").sort((a: any, b: any) => a.timestamp - b.timestamp)[0];
        console.log("oldest", oldest)

        //update recentMessages
        sqlite.replaceRecent(db, "recentMessages", String(Date.now()), `${traceId}`, timestamp);
        sqlite.deleteRow(db, "recentMessages", oldest.key);

        //update recentMessagesByChain
        if (chain) {
            oldest = sqlite.selectAll(db, "recentMessagesByChain").sort((a: any, b: any) => a.timestamp - b.timestamp)[0];
            console.log(oldest)
            sqlite.replaceRecent(db, "recentMessagesByChain", String(Date.now()), `${chain}:${traceId}`, timestamp );
            sqlite.deleteRow(db, "recentMessagesByChain", `${oldest.key}`);
        }
        return;
    }
    //add messages if tables not full
    sqlite.replaceRecent(db, "recentMessages", String(Date.now()), `${traceId}`, timestamp);

    if (chain) sqlite.replaceRecent(db, "recentMessagesByChain", String(Date.now()), `${chain}:${traceId}`, timestamp );
    return;
}


export function recentMessagesEndpoint(db: any, chain?: string, moduleHash?: string, limit?: number, distinct?: string, sortBy?: string) {

    let messages = sqlite.selectAllRecent(db,  "recentMessages", "*", sortBy, limit);

    if (distinct) messages = fetchDistinct(distinct, messages, db, chain, sortBy, limit);
    if (chain) messages = sqlite.selectAllRecent(db, "recentMessagesByChain", "*", sortBy, limit).filter((message: any) => message.value.includes(chain));
    if (moduleHash) messages = messages.filter((message: any) => message.value.includes(moduleHash));

    return toJSON(messages);
}

function fetchDistinct(distinct?: string, messages?: any, db?: any, chain?: string, sortBy?: string, limit?: number) {
    let chainList = sqlite.selectAll(db, "chain");
    if (distinct === "true") {

    let distinctChain = [];
        for (let i = 0; i < chainList.length; i++) {
            let chainName = chainList[i].key;

            messages = sqlite.selectAllRecent(db, "recentMessagesByChain", "*", sortBy, limit)
            messages = messages.filter((message: any) => message.value.includes(chainName));

            distinctChain.push(messages[0]);
            chainList.slice(i, 1);
        }
        let result = distinctChain.filter((notNull) => notNull !== undefined)
        return result;
    }
    return;
}
