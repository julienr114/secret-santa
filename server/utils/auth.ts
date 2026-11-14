import { z } from 'zod';

// Who a logged-in account is (README 8.4, 22.5). Pure.

// `guardian` is the organiser of one or more groups: the word stays in
// the code (journal actors, routes) although the screens say "organiser".
// `member` is everyone else: someone who logs in to find their draws.
export const ROLES = ['super_admin', 'guardian', 'member'] as const;
export type Role = (typeof ROLES)[number];
/** The roles that open the admin. */
export type AdminRole = Exclude<Role, 'member'>;

export const sessionUserSchema = z.object({
  role: z.enum(ROLES),
  accountId: z.string().min(1),
  sessionId: z.string().min(1),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;
/** A logged-in user who may use the admin. */
export type AdminUser = SessionUser & { role: AdminRole };

/**
 * The role of an account: super-admin by its flag, organiser when it
 * manages at least one group, plain member otherwise.
 * @param account - The account's flag and how many groups it organises.
 * @returns The role.
 */
export const roleOf = (account: {
  isSuperAdmin: boolean;
  groupCount: number;
}): Role => {
  if (account.isSuperAdmin) return 'super_admin';
  return account.groupCount > 0 ? 'guardian' : 'member';
};

/**
 * Whether the user may use the admin: members only have their home.
 * @param user - The logged-in user.
 * @returns True for super-admins and organisers.
 */
export const isAdminUser = (user: SessionUser): user is AdminUser =>
  user.role !== 'member';

/**
 * Super-admins may act on any group, organisers only on theirs.
 * @param user - The logged-in user, if any.
 * @param isMember - Whether the account organises the group.
 * @returns True when the group is open to them.
 */
export const canAccessGroup = (
  user: Pick<SessionUser, 'role'> | null | undefined,
  isMember: boolean,
): boolean => Boolean(user) && (user?.role === 'super_admin' || isMember);

/**
 * An organiser can be removed by a super-admin or by another organiser,
 * never by themselves: a slip would lock them out of their own group.
 * @param user - Who asks.
 * @param targetAccountId - The organiser to remove.
 * @returns True when allowed.
 */
export const canRemoveOrganizer = (
  user: Pick<SessionUser, 'role' | 'accountId'>,
  targetAccountId: string,
): boolean => user.role === 'super_admin' || user.accountId !== targetAccountId;

export const slugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, digits and dashes');
