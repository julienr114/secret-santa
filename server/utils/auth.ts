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

const SLUG_MAX = 40;
const SLUG_FALLBACK = 'groupe';

/**
 * The identifier of a group, from its name: lower case, no accents,
 * dashes between words.
 * @param name - The name of the group.
 * @returns A valid slug; a fallback when the name has no letter or digit.
 */
export const slugify = (name: string): string => {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX)
    .replace(/^-+|-+$/g, '');
  return slug.length >= 2 ? slug : SLUG_FALLBACK;
};

/**
 * A slug nobody uses yet: the wanted one, or the first free "-2", "-3"…
 * @param wanted - The slug derived from the name.
 * @param taken - Slugs already in use.
 * @returns The wanted slug, numbered when needed.
 */
export const freeSlug = (wanted: string, taken: readonly string[]): string => {
  const used = new Set(taken);
  const numbered = (n: number) => {
    const suffix = `-${n}`;
    return `${wanted.slice(0, SLUG_MAX - suffix.length)}${suffix}`;
  };
  const next = (n: number): string =>
    used.has(numbered(n)) ? next(n + 1) : numbered(n);
  return used.has(wanted) ? next(2) : wanted;
};
