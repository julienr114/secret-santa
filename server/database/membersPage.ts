import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { listEditions, participantCounts } from './editions';
import { entriesOfParty } from './members';
import {
  accounts,
  giftListHolders,
  giftListParties,
  giftListPeople,
  giftLists,
  familyMembers,
} from './schema';
import { forWhom, type LinePart } from '#shared/utils/lines';
import { entryParts, type EntryPart } from '#shared/utils/members';

// « Membres » (V3FeteMembres, ticket 117): by where each member came in,
// and where I may add someone (« Au Secret Santa », « À ma liste »).

/** A line of « Ajouter quelqu'un ». */
export type AddPlace =
  | {
      kind: 'santa';
      id: string;
      /** Its name, when several are being prepared. */
      name: string | null;
      participants: number;
      linkActive: boolean;
    }
  | { kind: 'list'; id: string; forWhom: LinePart | null };

/** What « Membres » says beyond the people themselves. */
export type MembersExtras = {
  /** By where each member came in, by person. */
  entries: Record<string, EntryPart[]>;
  /** « Ajouter quelqu'un ». */
  places: AddPlace[];
};

/**
 * By where each member of an event came in, and where I may add someone.
 * @param db - The database.
 * @param partyId - The event.
 * @param accountId - Me, who organises it.
 * @returns The ways in, and the places.
 */
export const membersExtras = async (
  db: Db,
  partyId: string,
  accountId: string,
): Promise<MembersExtras> => {
  const [santas, byPerson] = await Promise.all([
    listEditions(db, partyId),
    entriesOfParty(db, partyId),
  ]);
  const listIds = [
    ...new Set(
      [...byPerson.values()].flatMap((entries) =>
        entries.flatMap((entry) =>
          entry.kind === 'list' ? [entry.listId] : [],
        ),
      ),
    ),
  ];
  const makers =
    listIds.length === 0
      ? []
      : await db
          .select({
            id: giftLists.id,
            firstName: accounts.firstName,
            email: accounts.email,
          })
          .from(giftLists)
          .innerJoin(accounts, eq(accounts.id, giftLists.accountId))
          .where(inArray(giftLists.id, listIds));
  const lastYear = Math.max(0, ...santas.map((santa) => santa.year));
  const event = {
    santas: santas.map((santa) => ({
      id: santa.id,
      name: santa.label,
      current: santa.year === lastYear,
    })),
    lists: makers.map((maker) => ({
      id: maker.id,
      holder: maker.firstName ?? maker.email.split('@')[0] ?? '',
    })),
  };
  const entries = Object.fromEntries(
    [...byPerson].map(([personId, list]) => [
      personId,
      entryParts(list, event),
    ]),
  );
  const preparing = santas.filter((santa) => santa.status === 'preparing');
  const counts = await participantCounts(
    db,
    preparing.map((santa) => santa.id),
  );
  const mine = await db
    .select({ id: giftLists.id })
    .from(giftLists)
    .innerJoin(giftListHolders, eq(giftListHolders.listId, giftLists.id))
    .innerJoin(
      giftListParties,
      and(
        eq(giftListParties.listId, giftLists.id),
        eq(giftListParties.partyId, giftLists.partyId),
      ),
    )
    .where(
      and(
        eq(giftLists.partyId, partyId),
        eq(giftListHolders.accountId, accountId),
        eq(giftListHolders.level, 'manage'),
        eq(giftListParties.visibility, 'party'),
      ),
    );
  const people =
    mine.length === 0
      ? []
      : await db
          .select({
            listId: giftListPeople.listId,
            position: giftListPeople.position,
            name: familyMembers.firstName,
            isSelf: familyMembers.isSelf,
            ownerId: familyMembers.accountId,
            linkedAccountId: familyMembers.linkedAccountId,
            placeholder: familyMembers.placeholder,
          })
          .from(giftListPeople)
          .innerJoin(
            familyMembers,
            eq(familyMembers.id, giftListPeople.memberId),
          )
          .where(
            inArray(
              giftListPeople.listId,
              mine.map((list) => list.id),
            ),
          );
  return {
    entries,
    places: [
      ...preparing.map((santa): AddPlace => ({
        kind: 'santa',
        id: santa.id,
        name: preparing.length > 1 ? santa.label : null,
        participants: counts[santa.id] ?? 0,
        linkActive: santa.inviteCode !== null,
      })),
      ...mine.map((list): AddPlace => ({
        kind: 'list',
        id: list.id,
        forWhom: forWhom(
          people
            .filter(
              (person) => person.listId === list.id && !person.placeholder,
            )
            .toSorted((a, b) => a.position - b.position)
            .map((person) => ({
              name: person.name,
              me:
                (person.isSelf && person.ownerId === accountId) ||
                person.linkedAccountId === accountId,
            })),
        ),
      })),
    ],
  };
};
