import type { Result } from '#server/utils/result';

/** Narrows a Result in tests; a Fail is a test failure. */
export const valueOf = <T>(result: Result<T>): T => {
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result.value;
};

/** Narrows a Result to its Fail side in tests. */
export const failureOf = <T>(result: Result<T>) => {
  if (result.ok) throw new Error('expected a failure');
  return result;
};
