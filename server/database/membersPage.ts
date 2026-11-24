import { and, eq, inArray, or } from 'drizzle-orm';
import type { Db } from './client';
import { listEditions, participantCounts } from './editions';
import { currentYearOf } from './listSharing';
import {
  giftListHolders,
  giftListParties,
  giftListPeople,
  giftLists,
  familyMembers,
  participations,
  parties,
} from './schema';
import { forWhom, type LinePart } from '#shared/utils/lines';

// « Membres » (V3FeteMembres, tickets 117 and 158): the Secret Santa of
// the year each member takes part in, and where I may add someone (« Au
// Secret Santa », « À ma liste de cadeaux »), or what I may create when
// there is nowhere.

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
  /** The Secret Santa of its year, by name (ticket 158). */
  santas: { id: string; name: string }[];
  /** Those each member takes part in, by person. */
  takingPart: Record<string, string[]>;
  /** « Ajouter quelqu'un ». */
  places: AddPlace[];
  /**
   * With nowhere to add someone (ticket 158, as on the home, ticket 151):
   * « Créer un Secret Santa » when it has none this year, « Créer une
   * liste de cadeaux » when I hold none in it; the Secret Santa first
   * at Christmas, the list first elsewhere.
   */
  create: { santa: boolean; list: boolean; santaFirst: boolean };
};

/**
 * The Secret Santa each member of an event takes part in this year, and
 * where I may add someone.
 * @param db - The database.
 * @param partyId - The event.
 * @param accountId - Me, who organises it.
 * @returns The Secret Santa, the places, what may be created.
 */
export const membersExtras = async (
  db: Db,
  partyId: string,
  accountId: string,
): Promise<MembersExtras> => {
  const [santas, year, [party]] = await Promise.all([
    listEditions(db, partyId),
    currentYearOf(db, partyId),
    db
      .select({ category: parties.category })
      .from(parties)
      .where(eq(parties.id, partyId))
      .limit(1),
  ]);
  // Those of its current year, as on the home (ticket 108).
  const current = santas.filter((santa) => santa.year === year?.year);
  const [taking, held] = await Promise.all([
    db
      .select({
        personId: participations.personId,
        santaId: participations.secretSantaId,
      })
      .from(participations)
      .where(
        inArray(participations.secretSantaId, [
          '',
          ...current.map((santa) => santa.id),
        ]),
      ),
    // A list I hold in it, made for it or shared there.
    db
      .selectDistinct({ id: giftLists.id })
      .from(giftLists)
      .innerJoin(giftListHolders, eq(giftListHolders.listId, giftLists.id))
      .leftJoin(giftListParties, eq(giftListParties.listId, giftLists.id))
      .where(
        and(
          eq(giftListHolders.accountId, accountId),
          or(
            eq(giftLists.partyId, partyId),
            eq(giftListParties.partyId, partyId),
          ),
        ),
      ),
  ]);
  const takingPart = taking.reduce<Record<string, string[]>>(
    (all, row) => ({
      ...all,
      [row.personId]: [...(all[row.personId] ?? []), row.santaId],
    }),
    {},
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
    santas: current.map((santa) => ({ id: santa.id, name: santa.label })),
    takingPart,
    create: {
      santa: current.length === 0,
      list: held.length === 0,
      santaFirst: party?.category === 'christmas',
    },
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
