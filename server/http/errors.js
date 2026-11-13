// The impure shell turns business failures into HTTP errors here, nowhere
// else (README 7.1).

const STATUS_BY_REASON = {
  not_found: 404,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
  too_many_attempts: 429,
};

/**
 * Returns the value of an Ok result or throws the matching HTTP error.
 * @template T @param {import('../utils/result.js').Result<T>} result @returns {T}
 */
export const unwrap = (result) => {
  if (result.ok) return result.value;
  throw createError({
    statusCode: STATUS_BY_REASON[result.reason] ?? 400,
    statusMessage: result.reason,
    data: result.details,
  });
};

export const notFound = (what = 'not_found') =>
  createError({ statusCode: 404, statusMessage: what });
