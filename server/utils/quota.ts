import { z } from 'zod';
import { ok, fail, type Result } from './result';

// Who may create a group, and who may ask for it (README 22.2). Pure.

export const GROUP_QUOTA_MAX = 50;
export const REQUEST_MESSAGE_MAX = 500;

export const groupQuotaSchema = z.number().int().min(0).max(GROUP_QUOTA_MAX);
export const requestMessageSchema = z
  .string()
  .trim()
  .min(1)
  .max(REQUEST_MESSAGE_MAX);

/** What the quota rules need to know about an account. */
export type QuotaAccount = {
  isSuperAdmin: boolean;
  groupQuota: number;
  /** How many groups the account has created and that still exist. */
  createdCount: number;
};

/**
 * How many more groups the account may create.
 * @param account - Its flag, quota and number of created groups.
 * @returns The remaining count; infinite for a super-admin.
 */
export const remainingGroups = (account: QuotaAccount): number =>
  account.isSuperAdmin
    ? Number.POSITIVE_INFINITY
    : Math.max(0, account.groupQuota - account.createdCount);

/**
 * Whether the account may create a group now.
 * @param account - Its flag, quota and number of created groups.
 * @returns Ok, or `group_quota_reached`.
 */
export const canCreateGroup = (account: QuotaAccount): Result<true> =>
  remainingGroups(account) > 0 ? ok(true) : fail('group_quota_reached');

/**
 * Whether the account may ask for a group: not while it can already
 * create one, and one request at a time.
 * @param account - Its flag, quota and number of created groups.
 * @param hasPending - Whether a request of the account awaits a decision.
 * @returns Ok, `group_request_useless` or `group_request_pending`.
 */
export const canRequestGroup = (
  account: QuotaAccount,
  hasPending: boolean,
): Result<true> => {
  if (remainingGroups(account) > 0) return fail('group_request_useless');
  return hasPending ? fail('group_request_pending') : ok(true);
};

/**
 * The quota after a request is approved: room for exactly one more group.
 * @param account - Its quota and number of created groups.
 * @returns The new quota, capped.
 */
export const quotaAfterApproval = (
  account: Pick<QuotaAccount, 'groupQuota' | 'createdCount'>,
): number =>
  Math.min(
    GROUP_QUOTA_MAX,
    Math.max(account.groupQuota, account.createdCount) + 1,
  );

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
