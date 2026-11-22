import { and, count, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  auditLog,
  familyMembers,
  giftClaims,
  giftListHolders,
  giftListIdeas,
  giftListParties,
  giftListPeople,
  giftListVisits,
  giftLists,
  giftOffList,
  guesses,
  participations,
  parties,
  secretSantas,
} from './schema';
import { unseenNews, type UnseenNews } from './news';
import { guessesOpen } from '#server/utils/guesses';
import { listStage } from '#server/utils/listSharing';
import {
  gameLine,
  listLine,
  listTitle,
  organiserLine,
  participantLine,
  type LinePart,
  type LineText,
} from '#shared/utils/lines';

// What the lines of the home and of an event say (docs/spec/v3/lignes.md,
// tickets 112 and 120): the facts of the Secret Santas and of the lists
// read at once, for all the events of the page, then the words chosen by
// shared/utils/lines.ts. Only the texts leave: never who I drew, never
// who asks me for ideas. The news not seen yet (ticket 120) say what is
// new since my last visit.

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/** A Secret Santa as a line: for one who takes part, or its organiser. */
export type SantaAsked = {
  id: string;
  /** Whom it speaks to (lignes.md, « Qui voit quoi »). */
  as: 'participant' | 'organiser';
};

/**
 * Where the line « Devine qui » leads: the palmarès once out, the guesses
 * before.
 * @param path - My page of the Secret Santa.
 * @param game - The text of the line.
 * @returns The address.
 */
export const gamePath = (path: string, game: LineText): string =>
  game.parts[0]?.key.startsWith('lines.game.palmares')
    ? `${path}/devine/palmares`
    : `${path}/devine`;

/** A list as a line, in an event. */
export type ListAsked = { id: string; partyId: string };

/**
 * The key of a list's line: a list in two events has a line in each.
 * @param listId - The list.
 * @param partyId - The event.
 * @returns The key.
 */
export const listKey = (listId: string, partyId: string) =>
  `${listId}|${partyId}`;

/** The lines of a page. */
export type Lines = {
  santas: Map<string, { line: LineText; game: LineText | null }>;
  lists: Map<string, { title: LinePart; line: LineText }>;
};

/** Whether a news of a kind waits on a place. */
const waits = (
  unseen: readonly UnseenNews[],
  kind: UnseenNews['kind'],
  targetId: string,
) => unseen.some((one) => one.kind === kind && one.targetId === targetId);

/**
 * The lines of the Secret Santas of a page.
 * @param db - The database.
 * @param asked - The Secret Santas, and whom each speaks to.
 * @param mine - My persons (one per event), whose participations count.
 * @param unseen - My news not seen yet.
 * @param now - Now (ISO).
 * @returns The line of each, and its « Devine qui ».
 */
const santaLines = async (
  db: Db,
  asked: readonly SantaAsked[],
  mine: readonly string[],
  unseen: readonly UnseenNews[],
  now: string,
): Promise<Lines['santas']> => {
  const ids = asked.map((santa) => santa.id);
  if (ids.length === 0) return new Map();
  const [rows, counts, myRows, played, results] = await Promise.all([
    db.select().from(secretSantas).where(inArray(secretSantas.id, ids)),
    db
      .select({
        secretSantaId: participations.secretSantaId,
        all: count(),
        viewed: count(participations.firstViewedAt),
      })
      .from(participations)
      .where(inArray(participations.secretSantaId, ids))
      .groupBy(participations.secretSantaId),
    db
      .select()
      .from(participations)
      .where(
        and(
          inArray(participations.secretSantaId, ids),
          inArray(participations.personId, anyOf(mine)),
        ),
      ),
    db
      .selectDistinct({ secretSantaId: guesses.secretSantaId })
      .from(guesses)
      .where(
        and(
          inArray(guesses.secretSantaId, ids),
          inArray(guesses.guesserPersonId, anyOf(mine)),
        ),
      ),
    // The palmarès is out once its journal line is written.
    db
      .selectDistinct({ secretSantaId: auditLog.secretSantaId })
      .from(auditLog)
      .where(
        and(
          inArray(auditLog.secretSantaId, ids),
          eq(auditLog.type, 'guess_results_ready'),
        ),
      ),
  ]);
  return new Map(
    asked.flatMap((santa) => {
      const row = rows.find((one) => one.id === santa.id);
      if (!row) return [];
      const counted = counts.find((one) => one.secretSantaId === santa.id);
      const me = myRows.find((one) => one.secretSantaId === santa.id);
      const drawn = row.status !== 'preparing';
      const line =
        santa.as === 'organiser'
          ? organiserLine({
              status: row.status,
              revealed: Boolean(row.revealedAt),
              participants: counted?.all ?? 0,
              viewed: counted?.viewed ?? 0,
            })
          : participantLine({
              drawn,
              opened: Boolean(me?.firstViewedAt),
              revealed: Boolean(row.revealedAt),
              revealSeen: !waits(unseen, 'revealed', santa.id),
              asked: waits(unseen, 'hint_request', santa.id),
              receiverNews: waits(unseen, 'receiver_ideas', santa.id),
            });
      const game = gameLine({
        shown: row.guessMode !== 'none' && drawn && Boolean(me),
        open: guessesOpen(row, now),
        played:
          played.some((one) => one.secretSantaId === santa.id) ||
          Boolean(me?.guessSkippedAt),
        resultsOut: results.some((one) => one.secretSantaId === santa.id),
        resultsSeen: Boolean(me?.guessResultsSeenAt),
        endsAt: row.guessEndsAt,
      });
      return [[santa.id, { line, game }]];
    }),
  );
};

/**
 * The titles and lines of the lists of a page.
 * @param db - The database.
 * @param accountId - Me.
 * @param asked - The lists, each in its event.
 * @param unseen - My news not seen yet.
 * @returns The title and line of each list, by list and event.
 */
const listLines = async (
  db: Db,
  accountId: string,
  asked: readonly ListAsked[],
  unseen: readonly UnseenNews[],
): Promise<Lines['lists']> => {
  const ids = [...new Set(asked.map((list) => list.id))];
  if (ids.length === 0) return new Map();
  const [rows, people, holders, ideas, visits, claims, offList, events] =
    await Promise.all([
      db
        .select({ id: giftLists.id, sharedAt: giftLists.sharedAt })
        .from(giftLists)
        .where(inArray(giftLists.id, ids)),
      db
        .select({
          listId: giftListPeople.listId,
          position: giftListPeople.position,
          firstName: familyMembers.firstName,
          isSelf: familyMembers.isSelf,
          ownerId: familyMembers.accountId,
          linkedAccountId: familyMembers.linkedAccountId,
          placeholder: familyMembers.placeholder,
        })
        .from(giftListPeople)
        .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
        .where(inArray(giftListPeople.listId, ids)),
      db
        .select({
          listId: giftListHolders.listId,
          accountId: giftListHolders.accountId,
          firstName: accounts.firstName,
          createdAt: giftListHolders.createdAt,
        })
        .from(giftListHolders)
        .innerJoin(accounts, eq(accounts.id, giftListHolders.accountId))
        .where(inArray(giftListHolders.listId, ids)),
      db
        .select({
          listId: giftListIdeas.listId,
          createdAt: giftListIdeas.createdAt,
        })
        .from(giftListIdeas)
        .where(inArray(giftListIdeas.listId, ids)),
      db
        .select({
          listId: giftListVisits.listId,
          lastSeenAt: giftListVisits.lastSeenAt,
        })
        .from(giftListVisits)
        .where(
          and(
            inArray(giftListVisits.listId, ids),
            eq(giftListVisits.accountId, accountId),
          ),
        ),
      db
        .select({ listId: giftClaims.listId })
        .from(giftClaims)
        .where(
          and(
            inArray(giftClaims.listId, ids),
            eq(giftClaims.accountId, accountId),
          ),
        ),
      db
        .select({ listId: giftOffList.listId })
        .from(giftOffList)
        .where(
          and(
            inArray(giftOffList.listId, ids),
            eq(giftOffList.accountId, accountId),
          ),
        ),
      db
        .select({
          listId: giftListParties.listId,
          partyId: giftListParties.partyId,
          visibility: giftListParties.visibility,
          name: parties.name,
          fromList: parties.fromList,
        })
        .from(giftListParties)
        .innerJoin(parties, eq(parties.id, giftListParties.partyId))
        .where(inArray(giftListParties.listId, ids)),
    ]);
  return new Map(
    asked.map((list) => {
      const row = rows.find((one) => one.id === list.id);
      const held = holders.filter((one) => one.listId === list.id);
      const holder = held.some((one) => one.accountId === accountId);
      const inEvents = events.filter((one) => one.listId === list.id);
      const lastSeenAt = visits.find(
        (one) => one.listId === list.id,
      )?.lastSeenAt;
      const listIdeas = ideas.filter((one) => one.listId === list.id);
      const facts = {
        holder,
        people: people
          .filter((one) => one.listId === list.id && !one.placeholder)
          .toSorted((a, b) => a.position - b.position)
          .map((one) => ({
            name: one.firstName,
            me:
              (one.isSelf && one.ownerId === accountId) ||
              one.linkedAccountId === accountId,
          })),
        holders: held
          .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt))
          .flatMap((one) => (one.firstName ? [one.firstName] : [])),
        draft:
          listStage({
            isPublic: Boolean(row?.sharedAt),
            parties: inEvents.filter((one) => one.visibility === 'party')
              .length,
            givers: inEvents.filter((one) => one.visibility === 'giver').length,
          }) === 'draft',
        ideas: listIdeas.length,
        ticked: unseen
          .filter((one) => one.kind === 'ticked' && one.targetId === list.id)
          .reduce((sum, one) => sum + one.count, 0),
        giverOnly: inEvents.some(
          (one) => one.partyId === list.partyId && one.visibility === 'giver',
        ),
        elsewhere: inEvents
          .filter((one) => one.partyId !== list.partyId && !one.fromList)
          .map((one) => one.name),
        offered:
          claims.filter((one) => one.listId === list.id).length +
          offList.filter((one) => one.listId === list.id).length,
        newIdeas: listIdeas.filter(
          (one) => !lastSeenAt || one.createdAt > lastSeenAt,
        ).length,
      };
      return [
        listKey(list.id, list.partyId),
        { title: listTitle(facts), line: listLine(facts) },
      ];
    }),
  );
};

/**
 * The lines of a page: its Secret Santas and its lists.
 * @param db - The database.
 * @param input - Me, my persons, what the page shows.
 * @param input.accountId - My account.
 * @param input.persons - My persons in the events of the page.
 * @param input.santas - Its Secret Santas, and whom each speaks to.
 * @param input.lists - Its lists, each in its event.
 * @param now - Now (ISO).
 * @returns The lines, by Secret Santa, and by list and event
 *   (`${listId}|${partyId}`).
 */
export const loadLines = async (
  db: Db,
  input: {
    accountId: string;
    persons: readonly string[];
    santas: readonly SantaAsked[];
    lists: readonly ListAsked[];
  },
  now: string,
): Promise<Lines> => {
  const unseen = await unseenNews(db, input.accountId, now);
  const [santas, lists] = await Promise.all([
    santaLines(db, input.santas, input.persons, unseen, now),
    listLines(db, input.accountId, input.lists, unseen),
  ]);
  return { santas, lists };
};
