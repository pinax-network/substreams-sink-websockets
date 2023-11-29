export type Result<T = undefined, E = Error> = OkResult<T> | ErrResult<E>;

type OkResult<P = undefined> = { success: true } & (undefined extends P ? {} : { payload: P });
type ErrResult<E = Error> = { success: false; error: E };

export function Ok<
  P extends string | number | object | undefined = undefined,
  R = P extends undefined ? OkResult : OkResult<P>
>(payload?: P): R {
  if (payload !== undefined) {
    return { success: true, payload } as R;
  }
  return { success: true } as R;
}

export function Err<E = Error>(error: E): ErrResult<E> {
  return { success: false, error };
}

export function UnknownErr(err: unknown): ErrResult {
  if (err instanceof Error) {
    return Err(err);
  } else if (typeof err === "string") {
    return Err(new Error(err));
  } else {
    return Err(new Error(JSON.stringify(err)));
  }
}
