import type { Result } from '#server/utils/result';

// The impure shell turns business failures into HTTP errors here, nowhere
// else (README 7.1).

const STATUS_BY_REASON: Record<string, number> = {
  not_found: 404,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
  too_many_attempts: 429,
  invalid_transition: 409,
  no_solution: 409,
  too_few_participants: 409,
  draw_not_done: 409,
  edition_closed: 409,
  links_not_open: 409,
  wishlist_disabled: 403,
};

/** Returns the value of an Ok result or throws the matching HTTP error. */
export const unwrap = <T>(result: Result<T>): T => {
  if (result.ok) return result.value;
  throw createError({
    statusCode: STATUS_BY_REASON[result.reason] ?? 400,
    statusMessage: result.reason,
    data: result.details,
  });
};

export const notFound = (what = 'not_found') =>
  createError({ statusCode: 404, statusMessage: what });
