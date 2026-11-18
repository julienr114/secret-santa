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
  too_many_participants: 409,
  draw_not_done: 409,
  edition_closed: 409,
  gift_hints_disabled: 403,
  ideas_disabled: 403,
  hints_already_requested: 409,
  hints_already_given: 409,
  no_previous_hints: 404,
  result_not_seen: 409,
  email_failed: 502,
  group_quota_reached: 403,
  group_request_pending: 409,
  group_request_useless: 409,
  cannot_disable_self: 409,
  session_current: 409,
  person_is_organizer: 409,
  invite_expired: 410,
  invite_full: 409,
  person_has_other_email: 409,
  email_taken: 409,
  results_already_revealed: 409,
  results_revealed: 409,
  party_date_missing: 409,
  party_not_reached: 409,
  collecting_answers: 409,
  not_collecting_answers: 409,
  answers_not_ready: 409,
  invalid_answer: 400,
  guess_game_on: 409,
  guesses_off: 409,
  guesses_closed: 409,
  invalid_guess: 400,
  guess_needs_end: 400,
  guess_reminder_sent: 409,
  results_not_revealed: 409,
  list_incomplete: 409,
  list_shared: 409,
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
