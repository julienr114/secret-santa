// Hardening the spend (ticket 129, docs/spec/v3/administration.md,
// V3Admin): what the app counts by day, its caps, when the super-admin is
// warned, and when emails stop by themselves. Pure. An attack or a
// runaway costs no more than a cap fixed in advance.

/** What is counted by day. `warned_*` mark a warning already given. */
export const COUNTER_NAMES = [
  'emails_sent',
  'emails_rejected',
  'rate_limited',
  'login_failed',
  'server_error',
  'warned_emails_day',
  'warned_emails_month',
] as const;
export type CounterName = (typeof COUNTER_NAMES)[number];

/**
 * The caps of the emails: those of the email service's plan (100 a day,
 * 3 000 a month). Reached in the month, emails stop by themselves.
 */
export const EMAIL_CAPS = { day: 100, month: 3000 } as const;

/** At this share of a cap, the super-admin is warned (V3Admin). */
export const WARN_RATIO = 0.7;

/** A cap and where it stands. */
export type Gauge = {
  used: number;
  cap: number;
  /** Past the warning: 70 % of the cap. */
  warn: boolean;
  /** Reached. */
  full: boolean;
};

/**
 * Where a cap stands.
 * @param used - What is used.
 * @param cap - The cap.
 * @returns The gauge.
 */
export const gaugeOf = (used: number, cap: number): Gauge => ({
  used,
  cap,
  warn: used >= cap * WARN_RATIO,
  full: used >= cap,
});

/**
 * Whether a send crosses the warning of a cap: below 70 % before it, at
 * or over after.
 * @param before - What was used before the send.
 * @param sent - How many the send adds.
 * @param cap - The cap.
 * @returns True when the warning is to be given.
 */
export const crossesWarning = (
  before: number,
  sent: number,
  cap: number,
): boolean => before < cap * WARN_RATIO && before + sent >= cap * WARN_RATIO;

/**
 * Whether an email may leave: a login link always (README 22.5, « sauf
 * les liens de connexion »); another, not while emails are suspended.
 * @param input - Whether it is a login link, whether emails are
 *   suspended.
 * @param input.login - A login link.
 * @param input.paused - « Suspendre les emails » is on.
 * @returns True when it may leave.
 */
export const emailMayLeave = (input: {
  login: boolean;
  paused: boolean;
}): boolean => input.login || !input.paused;

/**
 * The month of a day, as the counters add it up.
 * @param day - « 2026-11-24 ».
 * @returns « 2026-11 ».
 */
export const monthOf = (day: string): string => day.slice(0, 7);
