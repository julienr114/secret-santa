import { z } from 'zod';
import { ok, fail, type Result } from './result';

// Accounts, magic links and sessions (README 22.5). Pure: the routes load
// rows and pass the clock in.

export const LOGIN_LINK_TTL_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** A session's "last seen" is refreshed at most this often. */
export const SESSION_TOUCH_MS = 60 * 60 * 1000;

/** Links one address, or one client, may ask for within the window. */
export const LINK_REQUESTS_MAX_PER_ACCOUNT = 5;
export const LINK_REQUESTS_MAX_PER_IP = 20;
export const LINK_REQUESTS_WINDOW_MS = 60 * 60 * 1000;

export const accountEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());

/** ISO date `ms` after `now`. */
export const isoAfter = (now: string, ms: number): string =>
  new Date(Date.parse(now) + ms).toISOString();

/**
 * Addresses that become super-admins the first time they ask for a link:
 * how a fresh install gets its first administrator.
 * @param setting - Comma-separated addresses, as in NUXT_SUPER_ADMIN_EMAILS.
 * @returns The valid addresses, lower-cased, without duplicates.
 */
export const superAdminEmails = (
  setting: string | null | undefined,
): string[] => [
  ...new Set(
    (setting ?? '').split(',').flatMap((part) => {
      const parsed = accountEmailSchema.safeParse(part);
      return parsed.success ? [parsed.data] : [];
    }),
  ),
];

export type LinkLike = { expiresAt: string; usedAt: string | null };

/**
 * Whether a login link can still be used: once, and before it expires.
 * @param link - The stored link.
 * @param now - ISO date.
 * @returns Ok, or why not (`link_used`, `link_expired`).
 */
export const usableLink = (link: LinkLike, now: string): Result<true> => {
  if (link.usedAt) return fail('link_used');
  if (Date.parse(now) >= Date.parse(link.expiresAt)) {
    return fail('link_expired');
  }
  return ok(true);
};

/**
 * Whether one more link may be requested, given the recent requests.
 * @param recent - How many were asked within the window, for the account
 *   and for the client address.
 * @param maxPerIp - Limit for one client address (raised for the tests).
 * @returns Ok, or `too_many_attempts`.
 */
export const canRequestLink = (
  recent: { forAccount: number; fromIp: number },
  maxPerIp: number = LINK_REQUESTS_MAX_PER_IP,
): Result<true> =>
  recent.forAccount >= LINK_REQUESTS_MAX_PER_ACCOUNT ||
  recent.fromIp >= maxPerIp
    ? fail('too_many_attempts')
    : ok(true);

export type SessionLike = { expiresAt: string; revokedAt: string | null };
export type AccountLike = { disabledAt: string | null };

/**
 * Whether a session still stands: not revoked, not expired, and its
 * account not disabled.
 * @param session - The stored session.
 * @param account - Its account.
 * @param now - ISO date.
 * @returns Ok, or `unauthorized`.
 */
export const activeSession = (
  session: SessionLike,
  account: AccountLike,
  now: string,
): Result<true> =>
  session.revokedAt ||
  account.disabledAt ||
  Date.parse(now) >= Date.parse(session.expiresAt)
    ? fail('unauthorized')
    : ok(true);

/**
 * Whether "last seen" is old enough to be worth a write.
 * @param lastSeenAt - ISO date of the last refresh.
 * @param now - ISO date.
 * @returns True when it should be refreshed.
 */
export const shouldTouchSession = (lastSeenAt: string, now: string): boolean =>
  Date.parse(now) - Date.parse(lastSeenAt) >= SESSION_TOUCH_MS;

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];
const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, 'iPhone'],
  [/iPad/, 'iPad'],
  [/Android/, 'Android'],
  [/Mac OS X/, 'Mac'],
  [/Windows/, 'Windows'],
  [/Linux/, 'Linux'],
];
/**
 * The label of the first pattern found in a text.
 * @param list - Patterns with their label, most specific first.
 * @param text - Where to look.
 * @returns The label, or null when no pattern matches.
 */
const firstMatch = (list: [RegExp, string][], text: string): string | null =>
  list.find(([pattern]) => pattern.test(text))?.[1] ?? null;

/**
 * A short name for the device of a session, for "my devices".
 * @param userAgent - The User-Agent header stored with the session.
 * @returns e.g. "iPhone · Safari", or null when nothing is recognised.
 */
export const deviceLabel = (
  userAgent: string | null | undefined,
): string | null => {
  const text = userAgent ?? '';
  const parts = [firstMatch(SYSTEMS, text), firstMatch(BROWSERS, text)].filter(
    (part): part is string => part !== null,
  );
  return parts.length > 0 ? parts.join(' · ') : null;
};
