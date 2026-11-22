import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import {
  giftListParties,
  parties,
  partyOrganisers,
  partyYears,
  persons,
} from './schema';
import { findAccountById } from './accounts';
import { insertPersonFromAccount } from './people';
import { forgetEntries, recordEntry } from './members';
import { newId } from '#server/http/context';
import {
  listPartySlug,
  ownPartyOf,
  type ListForParty,
} from '#server/utils/listParties';

// The parties of the lists made on the screens of before (ticket 101):
// each gets its own, with the list's id, its holders as members and its
// creator as organiser; a list linked to a draw goes into its party.

/**
 * Makes the party of a new list: the list, its year, its organiser, its
 * creator as a member, and the list in it.
 * @param db - The database.
 * @param list - The new list, with its id and its creator.
 * @param now - ISO date.
 * @returns Once made.
 */
export const createOwnParty = async (
  db: Db,
  list: ListForParty & { id: string; accountId: string },
  now: string,
) => {
  const { party, year } = ownPartyOf(list, now);
  await db.batch([
    db.insert(parties).values({
      id: list.id,
      slug: listPartySlug(crypto.getRandomValues(new Uint8Array(6))),
      ...party,
      createdBy: list.accountId,
      createdAt: now,
    }),
    db
      .insert(partyYears)
      .values({ id: newId(), partyId: list.id, ...year, createdAt: now }),
    db
      .insert(partyOrganisers)
      .values({ partyId: list.id, accountId: list.accountId, createdAt: now }),
    db.insert(giftListParties).values({
      id: newId(),
      listId: list.id,
      partyId: list.id,
      visibility: 'party',
      createdAt: now,
    }),
  ]);
  await joinOwnParty(db, list.id, list.accountId, now);
};

/**
 * Makes a holder of a list a member of its own party, once.
 * @param db - The database.
 * @param listId - The list, and the id of its own party.
 * @param accountId - The holder.
 * @param now - ISO date.
 * @returns Once done; nothing when the list has no party of its own.
 */
export const joinOwnParty = async (
  db: Db,
  listId: string,
  accountId: string,
  now: string,
) => {
  const [party] = await db
    .select({ id: parties.id })
    .from(parties)
    .where(and(eq(parties.id, listId), eq(parties.fromList, true)))
    .limit(1);
  const account = await findAccountById(db, accountId);
  if (!party || !account) return;
  const [member] = await db
    .select({ id: persons.id })
    .from(persons)
    .where(and(eq(persons.partyId, listId), eq(persons.email, account.email)))
    .limit(1);
  const personId = member?.id ?? newId();
  if (!member) {
    await insertPersonFromAccount(db, {
      groupId: listId,
      account,
      now,
      id: personId,
    });
  }
  // They hold the list: they came in by it (ticket 117).
  await recordEntry(db, { partyId: listId, personId, via: { listId }, now });
};

/** What a list says of itself, carried to its own party. */
export const renameOwnParty = (
  db: Db,
  listId: string,
  list: Partial<Pick<ListForParty, 'title' | 'iconEmoji' | 'iconColor'>>,
) => {
  const set = {
    ...(list.title === undefined ? {} : { name: list.title }),
    ...(list.iconEmoji === undefined ? {} : { iconEmoji: list.iconEmoji }),
    ...(list.iconColor === undefined ? {} : { iconColor: list.iconColor }),
  };
  return Object.keys(set).length === 0
    ? Promise.resolve()
    : db
        .update(parties)
        .set(set)
        .where(and(eq(parties.id, listId), eq(parties.fromList, true)));
};

/**
 * The statements that take a deleted list out of every party, and delete
 * its own party with what hangs from it.
 * @param db - The database.
 * @param listId - The list.
 * @returns The statements, to run before deleting the list.
 */
export const deleteListPartyStatements = (db: Db, listId: string) => {
  const own = and(eq(parties.id, listId), eq(parties.fromList, true));
  const ownId = db.select({ id: parties.id }).from(parties).where(own);
  return [
    db.delete(giftListParties).where(eq(giftListParties.listId, listId)),
    forgetEntries(db, { partyId: listId }),
    db.delete(persons).where(eq(persons.partyId, ownId)),
    db.delete(partyOrganisers).where(eq(partyOrganisers.partyId, ownId)),
    db.delete(partyYears).where(eq(partyYears.partyId, ownId)),
    db.delete(parties).where(own),
  ] as const;
};
