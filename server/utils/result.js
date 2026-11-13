// Business errors are values, not exceptions (README 7.1). The pure core
// returns Result objects; routes turn `ok: false` into HTTP errors.

/**
 * @template T
 * @typedef {{ ok: true, value: T }} Ok
 */
/**
 * @typedef {{ ok: false, reason: string, details: Record<string, unknown> }} Fail
 */
/**
 * @template T
 * @typedef {Ok<T> | Fail} Result
 */

/** @template T @param {T} value @returns {Ok<T>} */
export const ok = (value) => ({ ok: true, value });

/** @param {string} reason @param {Record<string, unknown>} [details] @returns {Fail} */
export const fail = (reason, details = {}) => ({ ok: false, reason, details });

/** @param {Result<unknown>} result */
export const isOk = (result) => result.ok === true;

/** Applies fn to the value of an Ok, passes a Fail through unchanged. */
export const map = (result, fn) => (result.ok ? ok(fn(result.value)) : result);

/** Chains a function that itself returns a Result. */
export const andThen = (result, fn) => (result.ok ? fn(result.value) : result);

/**
 * Turns a list of Results into a Result of a list: the first Fail wins.
 * @template T @param {Result<T>[]} results @returns {Result<T[]>}
 */
export const all = (results) =>
  results.reduce(
    (acc, result) =>
      andThen(acc, (values) => map(result, (value) => [...values, value])),
    ok([]),
  );
