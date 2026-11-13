// Business errors are values, not exceptions (README 7.1). The pure core
// returns Result objects; routes turn `ok: false` into HTTP errors.

export type Ok<T> = { ok: true; value: T };
export type Fail = {
  ok: false;
  reason: string;
  details: Record<string, unknown>;
};
export type Result<T> = Ok<T> | Fail;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const fail = (
  reason: string,
  details: Record<string, unknown> = {},
): Fail => ({
  ok: false,
  reason,
  details,
});

export const isOk = <T>(result: Result<T>): result is Ok<T> => result.ok;

/** Applies fn to the value of an Ok, passes a Fail through unchanged. */
export const map = <T, U>(result: Result<T>, fn: (value: T) => U): Result<U> =>
  result.ok ? ok(fn(result.value)) : result;

/** Chains a function that itself returns a Result. */
export const andThen = <T, U>(
  result: Result<T>,
  fn: (value: T) => Result<U>,
): Result<U> => (result.ok ? fn(result.value) : result);

/** Turns a list of Results into a Result of a list: the first Fail wins. */
export const all = <T>(results: Result<T>[]): Result<T[]> =>
  results.reduce<Result<T[]>>(
    (acc, result) =>
      andThen(acc, (values) => map(result, (value) => [...values, value])),
    ok([]),
  );
