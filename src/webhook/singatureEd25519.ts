import { PUBLIC_KEYS } from "../config.js";
import { toText } from "../fetch/cors.js";
import { Err, Ok, Result } from "../result.js";
import { cachedVerify } from "substreams-sink-webhook/auth";

export async function signatureEd25519(req: Request, text: string): Promise<Result<undefined, Response>> {
  const signature = req.headers.get("x-signature-ed25519");
  const expiry = req.headers.get("x-signature-ed25519-expiry");
  const publicKey = req.headers.get("x-signature-ed25519-public-key");

  if (!signature) return Err(toText("missing required signature in headers", 400));
  if (!expiry) return Err(toText("missing required expiry in headers", 400));
  if (!publicKey) return Err(toText("missing required public key in headers", 400));
  if (!text) return Err(toText("missing body", 400));

  if (!PUBLIC_KEYS.includes(publicKey)) {
    return Err(toText("invalid public key", 401));
  }

  if (!cachedVerify(signature, Number(expiry), publicKey)) {
    return Err(toText("invalid request signature", 401));
  }

  return Ok();
}
