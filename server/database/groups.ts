import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  groupMembers,
  groups,
  persons,
  type GroupRow,
} from './schema';
import { createAccount, findAccountByEmail } from './accounts';
import { insertPersonFromAccount } from './people';
import type { SessionUser } from '#server/utils/auth';

export type PublicGroup = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  /** Code of the invitation link to the group, null when closed. */
  inviteCode: string | null;
  /** Last day the link works, if any. */
  inviteUntil: string | null;
  /** How many may still join by the link. */
  invitePlaces: number | null;
  /** The organiser's words on the invitation page. */
  inviteMessage: string | null;
};

/** What the admin API exposes about a group. */
export const publicGroup = (group: GroupRow): PublicGroup => ({
  id: group.id,
  slug: group.slug,
  name: group.name,
  createdAt: group.createdAt,
  inviteCode: group.inviteCode,
  inviteUntil: group.inviteUntil,
  invitePlaces: group.invitePlaces,
  inviteMessage: group.inviteMessage,
});

// --- Organisers (README 22.5) ---------------------------------------------

/** Whether the account organises the group. */
export const isOrganizer = async (
  db: Db,
  groupId: string,
  accountId: string,
): Promise<boolean> => {
  const [row] = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.accountId, accountId),
      ),
    )
    .limit(1);
  return Boolean(row);
};

/** How many groups the account organises. */
export const organizedGroupCount = async (
  db: Db,
  accountId: string,
): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(groupMembers)
    .where(eq(groupMembers.accountId, accountId));
  return row?.n ?? 0;
};

/** The groups an account organises, by name. */
export const listOrganizedGroups = async (db: Db, accountId: string) => {
  const ids = (
    await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.accountId, accountId))
  ).map((row) => row.groupId);
  return ids.length === 0
    ? []
    : db
        .select()
        .from(groups)
        .where(inArray(groups.id, ids))
        .orderBy(asc(groups.name));
};

/**
 * The groups a user manages, by name: all of them for a super-admin,
 * those they organise for an organiser, none for a plain member.
 */
export const listManagedGroups = async (
  db: Db,
  user: Pick<SessionUser, 'role' | 'accountId'>,
): Promise<GroupRow[]> => {
  if (user.role === 'super_admin') {
    return db.select().from(groups).orderBy(asc(groups.name));
  }
  return user.role === 'guardian'
    ? listOrganizedGroups(db, user.accountId)
    : [];
};

export type Organizer = { accountId: string; email: string };

/** The organisers of a group, by address. */
export const listOrganizers = (db: Db, groupId: string): Promise<Organizer[]> =>
  db
    .select({ accountId: accounts.id, email: accounts.email })
    .from(groupMembers)
    .innerJoin(accounts, eq(accounts.id, groupMembers.accountId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(asc(accounts.email));

/**
 * Makes the owner of an address an organiser of the group, and a person
 * of it: an organiser takes part by default. Their account is created if
 * needed: they will prove the address with their first login link. The
 * person is copied from their profile, unless the group already has
 * someone with that address. Doing it twice changes nothing.
 */
export const addOrganizer = async (
  db: Db,
  { groupId, email, now }: { groupId: string; email: string; now: string },
): Promise<Organizer> => {
  const account =
    (await findAccountByEmail(db, email)) ??
    (await createAccount(db, { email, isSuperAdmin: false, now }));
  if (!(await isOrganizer(db, groupId, account.id))) {
    await db
      .insert(groupMembers)
      .values({ groupId, accountId: account.id, createdAt: now });
  }
  const [person] = await db
    .select({ id: persons.id })
    .from(persons)
    .where(and(eq(persons.groupId, groupId), eq(persons.email, account.email)))
    .limit(1);
  if (!person) await insertPersonFromAccount(db, { groupId, account, now });
  return { accountId: account.id, email: account.email };
};

/** Takes an organiser off a group; returns the removed row, if any. */
export const removeOrganizer = (db: Db, groupId: string, accountId: string) =>
  db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.accountId, accountId),
      ),
    )
    .returning({ accountId: groupMembers.accountId });
