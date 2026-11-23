import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  familyMembers,
  giftListHolders,
  giftListParties,
  giftLists,
  participations,
  parties,
  partyOrganisers,
  persons,
  type AccountRow,
} from './schema';
import { loadYears, timelineOf, todayOnServer } from './years';
import { gamePath, listKey, loadLines } from './lines';
import { decrypt } from '#server/utils/crypto';
import type { PartyCategory } from '#shared/utils/categories';
import type { LinePart, LineText } from '#shared/utils/lines';
import {
  listToResume,
  listYear,
  pastSummary,
  yearToPrepare,
} from '#shared/utils/years';

// The home of the V3 (docs/spec/v3/accueil-et-creation.md, ticket 103):
// the parties I am a member or an organiser of, each with its Secret
// Santas and the lists of its members, as the page of a party shows them
// (ticket 104); and my people, for the birthdays to come. A few queries
// for all the parties at once: D1 caps the queries of one request. Never
// a result of a draw.

export type HomeParty = {
  slug: string;
  name: string;
  category: PartyCategory;
  iconEmoji: string | null;
  /**
   * A birthday made for one of my people (ticket 118): « Bientôt » no
   * longer proposes theirs. Null otherwise, and for someone else's.
   */
  forMemberId: string | null;
  /**
   * The day it is shown at: its current year's (ticket 108), past for a
   * few days after it, then the next time it comes back.
   */
  date: string | null;
  /** « Préparer Noël 2027 », for its organiser: the year to prepare. */
  prepare: number | null;
  /** « Reprendre ma liste de l'an dernier »: the list to take again. */
  resume: string | null;
  /**
   * « Créer un Secret Santa » (ticket 151): I organise it, and it has none
   * this year.
   */
  createSanta: boolean;
  /**
   * The Secret Santas of its current year I take part in or organise,
   * with their text (lignes.md) and their « Devine qui ».
   */
  secretSantas: {
    id: string;
    label: string;
    to: string | null;
    line: LineText | null;
    game: { line: LineText; to: string } | null;
  }[];
  /** Its lists I may see: in the party for all its members, or mine. */
  lists: {
    id: string;
    mine: boolean;
    title: LinePart;
    line: LineText | null;
    to: string | null;
  }[];
};

export type HomeData = {
  parties: HomeParty[];
  /** « Les événements passés »: the latest, and how many others. */
  past: { latest: string; others: number } | null;
  people: {
    id: string;
    firstName: string;
    birthDate: string | null;
    isSelf: boolean;
  }[];
};

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: string[]) => (ids.length === 0 ? [''] : ids);

/**
 * What the home of an account shows.
 * @param db - The database.
 * @param account - Me.
 * @param dataKey - The key of the personal links.
 * @param today - The day, « 2026-11-20 » (UTC on the server).
 * @param now - Now (ISO), for the news not seen yet.
 * @returns My parties and my people.
 */
export const loadHome = async (
  db: Db,
  account: AccountRow,
  dataKey: CryptoKey,
  today = todayOnServer(),
  now = new Date().toISOString(),
): Promise<HomeData> => {
  const [mine, organised, people] = await Promise.all([
    db
      .select({ id: persons.id, partyId: persons.partyId })
      .from(persons)
      .where(eq(persons.email, account.email)),
    db
      .select({ partyId: partyOrganisers.partyId })
      .from(partyOrganisers)
      .where(eq(partyOrganisers.accountId, account.id)),
    db
      .select({
        id: familyMembers.id,
        firstName: familyMembers.firstName,
        birthDate: familyMembers.birthDate,
        isSelf: familyMembers.isSelf,
      })
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.accountId, account.id),
          eq(familyMembers.placeholder, false),
        ),
      ),
  ]);
  const organises = new Set(organised.map((row) => row.partyId));
  const ids = [...new Set([...mine.map((row) => row.partyId), ...organises])];
  if (ids.length === 0) return { parties: [], people, past: null };

  const [rows, years, shares, made] = await Promise.all([
    db.select().from(parties).where(inArray(parties.id, ids)),
    loadYears(db, ids),
    db
      .select({
        id: giftLists.id,
        partyId: giftListParties.partyId,
        accountId: giftLists.accountId,
        shareToken: giftLists.shareToken,
        visibility: giftListParties.visibility,
        eventDate: giftLists.eventDate,
        createdAt: giftLists.createdAt,
      })
      .from(giftListParties)
      .innerJoin(giftLists, eq(giftLists.id, giftListParties.listId))
      .where(inArray(giftListParties.partyId, ids))
      .orderBy(asc(giftListParties.createdAt)),
    // The lists made for these events (ticket 106): their holders see
    // them there, even as drafts.
    db
      .select({
        id: giftLists.id,
        partyId: giftLists.partyId,
        accountId: giftLists.accountId,
        shareToken: giftLists.shareToken,
        eventDate: giftLists.eventDate,
        createdAt: giftLists.createdAt,
      })
      .from(giftLists)
      .where(inArray(giftLists.partyId, ids))
      .orderBy(asc(giftLists.createdAt)),
  ]);
  // One row per list and event: shared there, else made for there.
  const links = [
    ...shares,
    ...made.flatMap((list) =>
      list.partyId &&
      !shares.some((row) => row.id === list.id && row.partyId === list.partyId)
        ? [{ ...list, partyId: list.partyId, visibility: 'made' as const }]
        : [],
    ),
  ];
  const listIds = [...new Set(links.map((list) => list.id))];
  const [held, taking] = await Promise.all([
    db
      .select({ listId: giftListHolders.listId })
      .from(giftListHolders)
      .where(
        and(
          eq(giftListHolders.accountId, account.id),
          inArray(giftListHolders.listId, anyOf(listIds)),
        ),
      ),
    db
      .select({
        secretSantaId: participations.secretSantaId,
        tokenEnc: participations.tokenEnc,
        tokenIv: participations.tokenIv,
      })
      .from(participations)
      .where(
        inArray(participations.personId, anyOf(mine.map((row) => row.id))),
      ),
  ]);
  const myLists = new Set(held.map((row) => row.listId));
  const paths = new Map(
    await Promise.all(
      taking.map(async (row) => {
        const token = await decrypt(
          { enc: row.tokenEnc, iv: row.tokenIv },
          dataKey,
        );
        return [
          row.secretSantaId,
          token.ok ? `/p/${token.value}` : null,
        ] as const;
      }),
    ),
  );

  const timelines = new Map(
    rows.map((party) => [party.id, timelineOf(party, years, today)]),
  );
  // What each card shows, before its words are read.
  const shown = rows.flatMap((party) => {
    const current = timelines.get(party.id)?.current;
    if (!current) return [];
    const organiser = organises.has(party.id);
    const santas = (
      years.find((row) => row.partyId === party.id && row.year === current.year)
        ?.santas ?? []
    ).filter((santa) => organiser || paths.has(santa.id));
    const lists = links.filter(
      (list) =>
        list.partyId === party.id &&
        listYear(list) >= current.year &&
        (list.visibility === 'party' || myLists.has(list.id)),
    );
    return [{ party, santas, lists }];
  });
  const lines = await loadLines(
    db,
    {
      accountId: account.id,
      persons: mine.map((row) => row.id),
      santas: shown.flatMap(({ santas }) =>
        santas.map((santa) => ({
          id: santa.id,
          // On the home, it speaks to me as one who takes part if I do.
          as: paths.has(santa.id)
            ? ('participant' as const)
            : ('organiser' as const),
        })),
      ),
      lists: shown.flatMap(({ party, lists }) =>
        lists.map((list) => ({ id: list.id, partyId: party.id })),
      ),
    },
    now,
  );
  return {
    people,
    past: pastSummary(
      rows.flatMap((party) =>
        (timelines.get(party.id)?.past ?? []).map((year) => ({
          ...year,
          name: party.name,
        })),
      ),
    ),
    parties: rows.flatMap((party) => {
      const timeline = timelines.get(party.id);
      const current = timeline?.current;
      // Over for good: it is in « Les événements passés » only.
      if (!current) return [];
      const ofYear = (year: number | undefined) =>
        years.find((row) => row.partyId === party.id && row.year === year)
          ?.santas ?? [];
      const santas = ofYear(current.year);
      const organiser = organises.has(party.id);
      const inParty = links.filter((list) => list.partyId === party.id);
      const mineByYear = inParty
        .filter((list) => myLists.has(list.id))
        .map((list) => ({ id: list.id, year: listYear(list) }))
        .toSorted((a, b) => b.year - a.year);
      return [
        {
          slug: party.slug,
          name: party.name,
          category: party.category,
          iconEmoji: party.iconEmoji,
          forMemberId: people.some((person) => person.id === party.forMemberId)
            ? party.forMemberId
            : null,
          date: current.date,
          prepare: yearToPrepare(
            {
              organiser,
              recurring: party.recurring,
              current,
              santas: santas.length,
              santasBefore: ofYear(timeline.past[0]?.year).length,
            },
            today,
          ),
          resume: listToResume(
            { recurring: party.recurring, current, mine: mineByYear },
            today,
          ),
          createSanta: organiser && santas.length === 0,
          secretSantas: santas
            .filter((santa) => organiser || paths.has(santa.id))
            .map((santa) => {
              const path = paths.get(santa.id) ?? null;
              const line = lines.santas.get(santa.id);
              return {
                id: santa.id,
                label: santa.label,
                // My own page first; the organiser's otherwise.
                to:
                  path ??
                  (organiser
                    ? `/admin/${party.slug}/editions/${santa.id}`
                    : null),
                line: line?.line ?? null,
                game:
                  line?.game && path
                    ? { line: line.game, to: gamePath(path, line.game) }
                    : null,
              };
            }),
          // The lists of its current year; those of before are in its
          // years over (ticket 108).
          lists: inParty
            .filter(
              (list) =>
                listYear(list) >= current.year &&
                (list.visibility === 'party' || myLists.has(list.id)),
            )
            .map((list) => {
              const line = lines.lists.get(listKey(list.id, party.id));
              return {
                id: list.id,
                mine: myLists.has(list.id),
                title: line?.title ?? { key: 'lines.list.mine' },
                line: line?.line ?? null,
                to: myLists.has(list.id)
                  ? `/listes/${list.id}`
                  : `/l/${list.shareToken}?depuis=${party.slug}`,
              };
            }),
        },
      ];
    }),
  };
};
