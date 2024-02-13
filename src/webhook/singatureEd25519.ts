import { PUBLIC_KEYS } from "../config.js";
import { toText } from "../fetch/cors.js";
import { Err, Ok, Result } from "../result.js";
import { verify } from "substreams-sink-webhook/auth";

export async function signatureEd25519(req: Request, body: string): Promise<Result<undefined, Response>> {
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = Number(req.headers.get("x-signature-timestamp"));

  if (!signature) return Err(toText("missing required signature in headers", 400));
  if (!timestamp) return Err(toText("missing required timestamp in headers", 400));
  if (!body) return Err(toText("missing body", 400));

  let isVerified = false;
  for ( const publicKey of PUBLIC_KEYS) {
    if (verify(timestamp, body, signature, publicKey)) {
      isVerified = true;
      break;
    }
  }

  if (!isVerified) {
    return Err(toText("invalid request signature", 401));
  }

  return Ok();
}
