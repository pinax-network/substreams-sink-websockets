import * as sqlite from "../sqlite.js";
import { DEFAULT_RECENT_MESSAGES_LIMIT, RECENT_MESSAGES_LIMIT } from "../config.js";
import Database from "bun:sqlite";
import { db } from "../../index.js";
import { toJSON } from "./cors.js";

export function parseLimit(searchParams: URLSearchParams) {
    const value = searchParams.get("limit");
    if (!value) return DEFAULT_RECENT_MESSAGES_LIMIT;
    const limit = Number(value);
    if (isNaN(limit)) throw new Error("limit must be a number");
    return limit;
}

export function parseSort(searchParams: URLSearchParams) {
    const value = searchParams.get("sort");
    if (!value) return "desc";
    if (!["asc", "desc"].includes(value)) throw new Error("sort must be asc or desc");
    return value;
}

export function handleMessages(req: Request) {
    const { searchParams} = new URL(req.url);
    // const distinct = searchParams.get("distinct");
    const limit = parseLimit(searchParams);
    const sort = parseSort(searchParams);
    const chain = searchParams.get("chain")
    const moduleHash = searchParams.get("moduleHash");

    // // error handling
    // if (distinct !== "true" && distinct !== null) return toText("distinct must be set to true if declared", 400 );
    // if (distinct === "true" && chain) return toText("chain cannot be set if distinct is set to true", 400 );
    return toJSON(selectMessages(db, limit, sort, chain, moduleHash));
    //console.log(messages)
}

export function insertMessages(db: Database, traceId: string, text: string, chain?: string) {
    const dbLength = sqlite.count(db, "messages");

    if (dbLength >= RECENT_MESSAGES_LIMIT) {
        let oldest = sqlite.selectAll(db, "messages").sort((a: any, b: any) => a.timestamp - b.timestamp)[0];

        // update messages
        sqlite.replace(db, "messages", String(Date.now()), `${traceId}`, "payload", text);
        sqlite.deleteRow(db, "messages", oldest.key);

        // update messagesByChain
        if (chain) {
            oldest = sqlite.selectAll(db, "messagesByChain").sort((a: any, b: any) => a.timestamp - b.timestamp)[0];
            sqlite.replace(db, "messagesByChain", String(Date.now()), `${chain}:${traceId}`, "payload", text );
            sqlite.deleteRow(db, "messagesByChain", `${oldest.key}`);
        }
        return;
    }
    // add messages if tables not full
    sqlite.replace(db, "messages", String(Date.now()), `${traceId}`, "payload", text);

    if (chain) sqlite.replace(db, "messagesByChain", String(Date.now()), `${chain}:${traceId}`, "payload", text );
}

export function selectMessages(db: Database, limit: number, sortBy: string, chain?: string, moduleHash?: string,) {

    let messages = sqlite.selectAll(db,  "messages", "*", sortBy, limit);

    // if (distinct) messages = selectDistinct(distinct, messages, db, chain, sortBy, limit);
    if (chain) messages = sqlite.selectAll(db, "messagesByChain", "*", sortBy, limit).filter((message: any) => message.value.includes(chain));
    if (moduleHash) messages = messages.filter((message: any) => message.value.includes(moduleHash));
    return messages
}

// export function selectDistinct(distinct?: string, messages?: any, db?: any, chain?: string, sortBy?: string, limit?: number) {
//     let chainList = sqlite.selectAll(db, "chain");
//     if (distinct === "true") {

//     let distinctChain = [];
//         for (let i = 0; i < chainList.length; i++) {
//             let chainName = chainList[i].key;

//             messages = sqlite.selectAllRecent(db, "messagesByChain", "*", sortBy, limit)
//             messages = messages.filter((message: any) => message.value.includes(chainName));

//             distinctChain.push(messages[0]);
//             chainList.slice(i, 1);
//         }
//         let result = distinctChain.filter((notNull) => notNull !== undefined)
//         return result;
//     }
//     return;
// }
