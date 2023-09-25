import nacl from "tweetnacl";

// validate signature using public key
export async function verify(body: string, timestamp: number, signature: string, PUBLIC_KEY: string){
    return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(PUBLIC_KEY, 'hex')
    )
};
