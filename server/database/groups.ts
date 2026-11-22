import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  partyOrganisers,
  parties,
  persons,
  type PartyRow,
} from './schema';
import { createAccount, findAccountByEmail } from './accounts';
import { insertPersonFromAccount } from './people';
import type { SessionUser } from '#server/utils/auth';

export type PublicGroup = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

/** What the admin API exposes about a group. */
export const publicGroup = (group: PartyRow): PublicGroup => ({
  id: group.id,
  slug: group.slug,
  name: group.name,
  createdAt: group.createdAt,
});

// --- Organisers (README 22.5) ---------------------------------------------

/** Whether the account organises the group. */
export const isOrganizer = async (
  db: Db,
  groupId: string,
  accountId: string,
): Promise<boolean> => {
  const [row] = await db
    .select({ groupId: partyOrganisers.partyId })
    .from(partyOrganisers)
    .where(
      and(
        eq(partyOrganisers.partyId, groupId),
        eq(partyOrganisers.accountId, accountId),
      ),
    )
    .limit(1);
  return Boolean(row);
};

/**
 * A party the screens of a group show: not one made for a list kept
 * apart before the V3 (ticket 101), until the pages of a party come.
 */
export const isGroup = eq(parties.fromList, false);

/** How many groups the account organises. */
export const organizedGroupCount = async (
  db: Db,
  accountId: string,
): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(partyOrganisers)
    .innerJoin(parties, eq(parties.id, partyOrganisers.partyId))
    .where(and(eq(partyOrganisers.accountId, accountId), isGroup));
  return row?.n ?? 0;
};

/** The groups an account organises, by name. */
export const listOrganizedGroups = async (db: Db, accountId: string) => {
  const ids = (
    await db
      .select({ groupId: partyOrganisers.partyId })
      .from(partyOrganisers)
      .where(eq(partyOrganisers.accountId, accountId))
  ).map((row) => row.groupId);
  return ids.length === 0
    ? []
    : db
        .select()
        .from(parties)
        .where(and(inArray(parties.id, ids), isGroup))
        .orderBy(asc(parties.name));
};

/**
 * The groups a user manages, by name: all of them for a super-admin,
 * those they organise for an organiser, none for a plain member.
 */
export const listManagedGroups = async (
  db: Db,
  user: Pick<SessionUser, 'role' | 'accountId'>,
): Promise<PartyRow[]> => {
  if (user.role === 'super_admin') {
    return db.select().from(parties).where(isGroup).orderBy(asc(parties.name));
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
    .from(partyOrganisers)
    .innerJoin(accounts, eq(accounts.id, partyOrganisers.accountId))
    .where(eq(partyOrganisers.partyId, groupId))
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
      .insert(partyOrganisers)
      .values({ partyId: groupId, accountId: account.id, createdAt: now });
  }
  const [person] = await db
    .select({ id: persons.id })
    .from(persons)
    .where(and(eq(persons.partyId, groupId), eq(persons.email, account.email)))
    .limit(1);
  if (!person) await insertPersonFromAccount(db, { groupId, account, now });
  return { accountId: account.id, email: account.email };
};

/** Takes an organiser off a group; returns the removed row, if any. */
export const removeOrganizer = (db: Db, groupId: string, accountId: string) =>
  db
    .delete(partyOrganisers)
    .where(
      and(
        eq(partyOrganisers.partyId, groupId),
        eq(partyOrganisers.accountId, accountId),
      ),
    )
    .returning({ accountId: partyOrganisers.accountId });

/**
 * How many organisers a group has: the participant's texts say « ton
 * organisateur » or « tes organisateurs ».
 * @param db - The database.
 * @param groupId - The group.
 * @returns The count.
 */
export const organizerCount = async (db: Db, groupId: string) =>
  (await listOrganizers(db, groupId)).length;
