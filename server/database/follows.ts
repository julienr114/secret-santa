import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  familyMembers,
  giftListFollows,
  giftListHolders,
  giftListPeople,
  giftLists,
  parties,
  type GiftListRow,
} from './schema';
import { accountsWhereShared } from './listSharing';
import { loadYears, timelineOf } from './years';
import { newId } from '#server/http/context';
import { listIsPast } from '#shared/utils/years';
import {
  followersToTell,
  followState,
  type FollowChoice,
  type FollowedEvent,
  type FollowState,
} from '#server/utils/follows';

// Following a list, or one person of it (ticket 122): what an account
// follows, and who is told. Nobody is told who follows a list.

/**
 * What I follow on a list.
 * @param db - The database.
 * @param accountId - Me.
 * @param listId - The list.
 * @returns Where I am.
 */
export const myFollowState = async (
  db: Db,
  accountId: string,
  listId: string,
): Promise<FollowState> =>
  followState(
    await db
      .select({ listPersonId: giftListFollows.listPersonId })
      .from(giftListFollows)
      .where(
        and(
          eq(giftListFollows.accountId, accountId),
          eq(giftListFollows.listId, listId),
        ),
      ),
  );

/**
 * Saves what I follow on a list, in place of what I followed: the whole
 * list, or some of its people (those not on it are left out).
 * @param db - The database.
 * @param input - Me, the list, my choice.
 * @param input.accountId - Me.
 * @param input.listId - The list.
 * @param input.choice - The whole list, or these people.
 * @param now - Now (ISO).
 * @returns Where I am now.
 */
export const saveFollow = async (
  db: Db,
  input: { accountId: string; listId: string; choice: FollowChoice },
  now: string,
): Promise<FollowState> => {
  const people = input.choice.list
    ? []
    : (
        await db
          .select({ id: giftListPeople.id })
          .from(giftListPeople)
          .where(
            and(
              eq(giftListPeople.listId, input.listId),
              inArray(giftListPeople.id, [...input.choice.people, '']),
            ),
          )
      ).map((row) => row.id);
  const rows = input.choice.list ? [null] : people;
  await db.batch([
    db
      .delete(giftListFollows)
      .where(
        and(
          eq(giftListFollows.accountId, input.accountId),
          eq(giftListFollows.listId, input.listId),
        ),
      ),
    ...rows.map((listPersonId) =>
      db.insert(giftListFollows).values({
        id: newId(),
        listId: input.listId,
        accountId: input.accountId,
        listPersonId,
        createdAt: now,
      }),
    ),
  ]);
  return followState(rows.map((listPersonId) => ({ listPersonId })));
};

/** A list I follow, as « Me prévenir » shows it. */
export type FollowedList = {
  listId: string;
  title: string;
  /** The first names of the people I follow; empty for the whole list. */
  people: string[];
};

/**
 * The lists I follow, by name.
 * @param db - The database.
 * @param accountId - Me.
 * @returns The lists, each with whom I follow on it.
 */
export const myFollowedLists = async (
  db: Db,
  accountId: string,
): Promise<FollowedList[]> => {
  const rows = await db
    .select({
      listId: giftListFollows.listId,
      title: giftLists.title,
      firstName: familyMembers.firstName,
      listPersonId: giftListFollows.listPersonId,
    })
    .from(giftListFollows)
    .innerJoin(giftLists, eq(giftLists.id, giftListFollows.listId))
    .leftJoin(
      giftListPeople,
      eq(giftListPeople.id, giftListFollows.listPersonId),
    )
    .leftJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(eq(giftListFollows.accountId, accountId));
  const lists = [...new Set(rows.map((row) => row.listId))].map((listId) => {
    const mine = rows.filter((row) => row.listId === listId);
    const whole = mine.some((row) => row.listPersonId === null);
    return {
      listId,
      title: mine[0]!.title,
      people: whole
        ? []
        : mine.flatMap((row) => (row.firstName ? [row.firstName] : [])),
    };
  });
  return lists.toSorted((a, b) => a.title.localeCompare(b.title));
};

/**
 * Whether a list is of a year over: the rule of the years of its event.
 * @param db - The database.
 * @param list - The list.
 * @returns True once its year is over.
 */
const isPastList = async (db: Db, list: GiftListRow): Promise<boolean> => {
  if (!list.partyId) return false;
  const [party] = await db
    .select()
    .from(parties)
    .where(eq(parties.id, list.partyId))
    .limit(1);
  if (!party) return false;
  return listIsPast(timelineOf(party, await loadYears(db, [party.id])), list);
};

/**
 * The accounts to tell of something new on a list they follow: never
 * those who hold it, nor who did it, nor on a list of a year over, nor
 * those who may no longer open it (shared with fewer, out of the event):
 * a public list opens to all, another to the members and organisers of
 * the events it is shared in with everyone.
 * @param db - The database.
 * @param input - The list, what happened, who did it.
 * @param input.listId - The list.
 * @param input.happened - A new idea (for whom), or a person added.
 * @param input.by - Who did it.
 * @returns The accounts.
 */
export const followersOf = async (
  db: Db,
  input: { listId: string; happened: FollowedEvent; by: string },
): Promise<string[]> => {
  const [[list], follows] = await Promise.all([
    db.select().from(giftLists).where(eq(giftLists.id, input.listId)).limit(1),
    db
      .select({
        accountId: giftListFollows.accountId,
        listPersonId: giftListFollows.listPersonId,
      })
      .from(giftListFollows)
      .where(eq(giftListFollows.listId, input.listId)),
  ]);
  if (!list || follows.length === 0) return [];
  const [holders, readers, past] = await Promise.all([
    db
      .select({ accountId: giftListHolders.accountId })
      .from(giftListHolders)
      .where(eq(giftListHolders.listId, list.id)),
    list.sharedAt ? Promise.resolve(null) : accountsWhereShared(db, list.id),
    isPastList(db, list),
  ]);
  const open = readers ? new Set(readers.map((one) => one.id)) : null;
  return followersToTell(follows, input.happened, {
    holders: new Set(holders.map((row) => row.accountId)),
    mayOpen: (accountId) => open === null || open.has(accountId),
    by: input.by,
    past,
  });
};

/**
 * The first name of a person of a list.
 * @param db - The database.
 * @param listPersonId - The person on the list.
 * @returns Their first name, or null.
 */
export const listPersonName = async (
  db: Db,
  listPersonId: string | null,
): Promise<string | null> => {
  if (!listPersonId) return null;
  const [row] = await db
    .select({
      firstName: familyMembers.firstName,
      placeholder: familyMembers.placeholder,
    })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(eq(giftListPeople.id, listPersonId))
    .limit(1);
  // A list without people has a person of its own, without a name.
  return row && !row.placeholder ? row.firstName : null;
};
