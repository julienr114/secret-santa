import { z } from 'zod';

// Admin sessions and login throttling (README 8.4). Pure: the routes load
// attempts from the database and pass them in.

export const ROLES = ['super_admin', 'guardian'] as const;
export type Role = (typeof ROLES)[number];

export const sessionUserSchema = z.object({
  role: z.enum(ROLES),
  groupId: z.string().min(1).nullable().default(null),
  groupSlug: z.string().min(1).nullable().default(null),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const LOGIN_MAX_FAILURES = 10;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Super-admins may act on any group, guardians only on their own. */
export const canAccessGroup = (
  user: SessionUser | null | undefined,
  groupId: string,
): boolean =>
  Boolean(user) && (user?.role === 'super_admin' || user?.groupId === groupId);

export type Throttle = {
  blocked: boolean;
  retryAfterSeconds: number;
  failures: number;
};

/**
 * Decides whether a login attempt is allowed given recent failures.
 * @param failureDates ISO dates of recent failures (same scope and ip)
 * @param now ISO date
 */
export const loginThrottle = (
  failureDates: string[],
  now: string,
): Throttle => {
  const nowMs = Date.parse(now);
  const recent = failureDates
    .map((d) => Date.parse(d))
    .filter((ms) => Number.isFinite(ms) && nowMs - ms < LOGIN_WINDOW_MS);
  const blocked = recent.length >= LOGIN_MAX_FAILURES;
  const oldest = Math.min(...recent);
  const retryAfterSeconds = blocked
    ? Math.ceil((oldest + LOGIN_WINDOW_MS - nowMs) / 1000)
    : 0;
  return { blocked, retryAfterSeconds, failures: recent.length };
};

export const GUARDIAN_PASSWORD_MIN = 10;
export const guardianPasswordSchema = z
  .string()
  .min(GUARDIAN_PASSWORD_MIN)
  .max(200);

export const slugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, digits and dashes');
