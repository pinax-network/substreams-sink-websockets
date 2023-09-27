import { expect, test } from "bun:test";
import { verify } from "./verify.js";

const PUBLIC_KEY = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

test("verify", async () => {
    const body = '{"cursor":"gBCLb0z81lU8vbvZVzJkEaWwLpc_DFhqVQ3jLxVJgYH2pSTFicymUzd9bx2GlKH51RboGgmo19eZRX588ZED7YW8y7FhuSM6EHh4wNzo87Dne6KjPQlIIOhjC-iJMNncUT7SYgz9f7UI5N_nb6XZMxMyMZEuK2blizdZqoZXIfAVsHthkjz6cJ6Bga_A-YtEq-AnEuf1xn6lDzF1Lx4LOc_RNqGe6z4nN3Rq","clock":{"timestamp":"2023-06-15T04:21:58.000Z","number":250665484,"id":"0ef0da0cf870f489833ac498da073acadf895d22f3dce68483aa43cac1d27b17"},"manifest":{"chain":"wax","moduleName":"map_transfers","moduleHash":"6aa24e6aa34db4a4faf55c69c6f612aeb06053c2"},"data":{"items":[{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":2,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"banxawallet1","to":"atomicmarket","quantity":"1340.00000000 WAX","memo":"deposit","precision":8,"amount":"134000000000","value":1340},{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":7,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"atomicmarket","to":"jft4m.c.wam","quantity":"1206.00000000 WAX","memo":"AtomicMarket Sale Payout - ID #129675349","precision":8,"amount":"120600000000","value":1206}]}}'
    const timestamp = 1686802918;
    const signature = "a2e1437d2b32774418f46365d4dccb4509be5469ed24ba0d1707ce4ca76dd7fbe0b01597d9c91391fba5316e917d4dca3134a6c1f2c283d708c02cd33d5b080d";
    const msg = Buffer.from(timestamp + body);
    const isVerified = await verify(msg, signature, PUBLIC_KEY);
    expect(isVerified).toBeTruthy();
});

test("ping", () => {
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";
    const body = '{"message":"PING"}';
    const sig = "d7b6b6b76ffb3ad58337d3082bcbeef39de1c2c4cd19f9d24955974358bb85e4bbdde31d055f60b1035750b4ca07e4e4c1398924106352577509b077ddd85802"
    const timestamp = 1686865337
    const msg = Buffer.from(timestamp + body);

    expect(verify(msg, sig, publicKey)).toBeTruthy();
    expect(verify(msg, sig, invalidPublicKey)).toBeFalsy();
});

test("special characters", () => {
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const body = '(蛮龙自助托管1.0.567,微信:cqml17,telegram:https://t.me/+1DiBsv2_SCM4ODZl,Download:https://cdn.chosan.cn/static/game-asist/%E8%9B%AE%E9%BE%99%E8%87%AA%E5%8A%A9%E6%89%98%E7%AE%A1%20Setup%200.1.198.exe)批量cp3a3x9mk7:电锯#9596#本次产出WOOD共3';
    const timestamp = 1686865337
    const sig = "58033ab867ff3be7eaba373a50ea8a21b716ef5b0cbab8663e48e82ad6694eec17281c132ccde4dbe61ff19e2263513e265a2da90de8748e7c70c818d489cc04";
    const msg = Buffer.from(timestamp + body);
    expect(verify(msg, sig, publicKey)).toBeTruthy();
});