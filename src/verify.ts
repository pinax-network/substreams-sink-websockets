import nacl from "tweetnacl";

// validate signature using public key
export function verify(msg: Buffer, sig: string, publicKey: string) {
    return nacl.sign.detached.verify(
        msg,
        Buffer.from(sig, "hex"),
        Buffer.from(publicKey, "hex")
    );
}