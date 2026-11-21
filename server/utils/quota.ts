import { z } from 'zod';
import { ok, fail, type Result } from './result';

// The limit of the V3 on organising (docs/spec/v3/modele.md, « Les
// limites »): no request to anyone, 3 Secret Santa in progress per account.
// The 30 members of a party are in ./parties. Pure.

/** The limit of a new account. */
export const SECRET_SANTA_LIMIT = 3;
/** The most a super-admin may give one account. */
export const SECRET_SANTA_LIMIT_MAX = 50;

export const secretSantaLimitSchema = z
  .number()
  .int()
  .min(0)
  .max(SECRET_SANTA_LIMIT_MAX);

/** What the limit needs to know about an account. */
export type QuotaAccount = {
  isSuperAdmin: boolean;
  secretSantaLimit: number;
  /** The Secret Santa it organises that are not closed. */
  organisedCount: number;
};

/**
 * How many more Secret Santa the account may organise.
 * @param account - Its flag, limit and Secret Santa in progress.
 * @returns The remaining count; infinite for a super-admin.
 */
export const remainingSecretSantas = (account: QuotaAccount): number =>
  account.isSuperAdmin
    ? Number.POSITIVE_INFINITY
    : Math.max(0, account.secretSantaLimit - account.organisedCount);

/**
 * Whether the account may organise one more Secret Santa now.
 * @param account - Its flag, limit and Secret Santa in progress.
 * @returns Ok, or `secret_santa_limit_reached`.
 */
export const canOrganiseSecretSanta = (account: QuotaAccount): Result<true> =>
  remainingSecretSantas(account) > 0
    ? ok(true)
    : fail('secret_santa_limit_reached');

/**
 * A super-admin may disable any account but their own: a slip would lock
 * them out.
 * @param actorId - Who asks.
 * @param targetId - The account to disable.
 * @returns Ok, or `cannot_disable_self`.
 */
export const canDisableAccount = (
  actorId: string,
  targetId: string,
): Result<true> =>
  actorId === targetId ? fail('cannot_disable_self') : ok(true);

/**
 * How many groups the free plans comfortably carry: Resend sends 3 000
 * emails a month for free, about a hundred groups' invitations, results
 * and reminders. Past it, accepting more groups needs a second thought.
 */
export const APP_GROUPS_COMFORT = 50;

/**
 * Whether one more group stays within what the app comfortably carries.
 * @param groups - How many groups exist.
 * @returns `ok`, `near` from 80 % of the comfort level, `over` past it.
 */
export const appLoad = (groups: number): 'ok' | 'near' | 'over' => {
  const next = groups + 1;
  if (next > APP_GROUPS_COMFORT) return 'over';
  return next >= APP_GROUPS_COMFORT * 0.8 ? 'near' : 'ok';
};
