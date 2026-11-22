import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  assignments,
  giftClaims,
  giftGiverClaims,
  giftListHolders,
  giftListIdeas,
  giftListParties,
  giftLists,
  giftOffList,
  participations,
  parties,
  partyOrganisers,
  persons,
  secretSantas,
  accounts,
  type AccountRow,
  type PartyRow,
} from './schema';
import { loadYears, timelineOf, type LoadedYear } from './years';
import { listKey, loadLines } from './lines';
import { loadForWhom } from './forWhom';
import { nowIso } from '#server/http/context';
import { decrypt } from '#server/utils/crypto';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import {
  deedsOf,
  yearKey,
  type ListCounts,
  type PartyList,
} from '#server/utils/pastYears';
import type { PartyCategory } from '#shared/utils/categories';
import type { ForWhom } from '#shared/utils/forWhom';
import type { LinePart } from '#shared/utils/lines';
import { listYear, type PastDeed } from '#shared/utils/years';

// What the pages of the years over need (ticket 108): the lists of the
// events, and what I did in each year over (docs/spec/v3/lignes.md, « Les
// lignes des événements passés »). My own result is read here, for me,
// and only for a year over; never anyone else's.

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/**
 * The lists of some events, one row per list and event, with their year
 * (Q-020).
 * @param db - The database.
 * @param partyIds - The events.
 * @returns The lists.
 */
export const loadPartyLists = async (
  db: Db,
  partyIds: readonly string[],
): Promise<PartyList[]> => {
  const columns = {
    id: giftLists.id,
    accountId: giftLists.accountId,
    shareToken: giftLists.shareToken,
    eventDate: giftLists.eventDate,
    createdAt: giftLists.createdAt,
  };
  const [shares, made] = await Promise.all([
    db
      .select({
        ...columns,
        partyId: giftListParties.partyId,
        visibility: giftListParties.visibility,
      })
      .from(giftListParties)
      .innerJoin(giftLists, eq(giftLists.id, giftListParties.listId))
      .where(inArray(giftListParties.partyId, anyOf(partyIds))),
    db
      .select({ ...columns, partyId: giftLists.partyId })
      .from(giftLists)
      .where(inArray(giftLists.partyId, anyOf(partyIds))),
  ]);
  const rows = [
    ...shares,
    ...made.flatMap((list) =>
      list.partyId &&
      !shares.some((row) => row.id === list.id && row.partyId === list.partyId)
        ? [{ ...list, partyId: list.partyId, visibility: 'made' as const }]
        : [],
    ),
  ];
  return rows.map(({ eventDate, createdAt, ...list }) => ({
    ...list,
    year: listYear({ eventDate, createdAt }),
  }));
};

/**
 * The lists I hold among some.
 * @param db - The database.
 * @param accountId - Me.
 * @param listIds - The lists.
 * @returns Their ids.
 */
export const heldAmong = async (
  db: Db,
  accountId: string,
  listIds: readonly string[],
): Promise<Set<string>> =>
  new Set(
    (
      await db
        .select({ listId: giftListHolders.listId })
        .from(giftListHolders)
        .where(
          and(
            eq(giftListHolders.accountId, accountId),
            inArray(giftListHolders.listId, anyOf(listIds)),
          ),
        )
    ).map((row) => row.listId),
  );

/**
 * Counts, list by list, what I gave and what was given on the lists I
 * hold: a few queries whatever the number of lists.
 * @param db - The database.
 * @param accountId - Me.
 * @param listIds - The lists.
 * @param held - Those I hold.
 * @returns The counts.
 */
export const listCounts = async (
  db: Db,
  accountId: string,
  listIds: readonly string[],
  held: ReadonlySet<string>,
): Promise<ListCounts> => {
  const mine = [...held];
  const [claims, offList, heldClaims, giverClaims, heldOffList, ideas] =
    await Promise.all([
      db
        .select({ listId: giftClaims.listId })
        .from(giftClaims)
        .where(
          and(
            eq(giftClaims.accountId, accountId),
            inArray(giftClaims.listId, anyOf(listIds)),
          ),
        ),
      db
        .select({ listId: giftOffList.listId })
        .from(giftOffList)
        .where(
          and(
            eq(giftOffList.accountId, accountId),
            inArray(giftOffList.listId, anyOf(listIds)),
          ),
        ),
      db
        .select({ listId: giftClaims.listId, ideaId: giftClaims.ideaId })
        .from(giftClaims)
        .where(inArray(giftClaims.listId, anyOf(mine))),
      db
        .select({
          listId: giftGiverClaims.listId,
          ideaId: giftGiverClaims.ideaId,
        })
        .from(giftGiverClaims)
        .where(inArray(giftGiverClaims.listId, anyOf(mine))),
      db
        .select({ listId: giftOffList.listId })
        .from(giftOffList)
        .where(inArray(giftOffList.listId, anyOf(mine))),
      db
        .select({ listId: giftListIdeas.listId })
        .from(giftListIdeas)
        .where(inArray(giftListIdeas.listId, anyOf(mine))),
    ]);
  const tally = (rows: readonly { listId: string }[]) =>
    rows.reduce(
      (counts, row) =>
        counts.set(row.listId, (counts.get(row.listId) ?? 0) + 1),
      new Map<string, number>(),
    );
  // An idea given by several counts once.
  const givenIdeas = [
    ...new Set(
      [...heldClaims, ...giverClaims].map(
        (row) => `${row.listId} ${row.ideaId}`,
      ),
    ),
  ].map((key) => ({ listId: key.split(' ')[0] ?? '' }));
  return {
    offered: tally([...claims, ...offList]),
    received: tally([...givenIdeas, ...heldOffList]),
    ideas: tally(ideas),
  };
};

/**
 * The first names I drew, by Secret Santa: my own result, read for me
 * alone, for the years over the caller asks about.
 * @param db - The database.
 * @param account - Me.
 * @param santaIds - The Secret Santa of the years over.
 * @param dataKey - The key of the draws.
 * @returns The first names, by Secret Santa.
 */
export const myReceivers = async (
  db: Db,
  account: AccountRow,
  santaIds: readonly string[],
  dataKey: CryptoKey,
): Promise<Map<string, string>> => {
  if (santaIds.length === 0) return new Map();
  const rows = await db
    .select({
      secretSantaId: assignments.secretSantaId,
      receiverEnc: assignments.receiverEnc,
      receiverIv: assignments.receiverIv,
    })
    .from(assignments)
    .innerJoin(persons, eq(persons.id, assignments.giverPersonId))
    .where(
      and(
        eq(persons.email, account.email),
        inArray(assignments.secretSantaId, [...santaIds]),
      ),
    );
  const receivers = await Promise.all(
    rows.map(async (row) => {
      const id = await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      );
      return id.ok ? ([row.secretSantaId, id.value] as const) : null;
    }),
  );
  const found = receivers.flatMap((row) => (row ? [row] : []));
  const names = new Map(
    found.length === 0
      ? []
      : (
          await db
            .select({ id: persons.id, firstName: persons.firstName })
            .from(persons)
            .where(
              inArray(
                persons.id,
                found.map(([, id]) => id),
              ),
            )
        ).map((row) => [row.id, row.firstName]),
  );
  return new Map(
    found.flatMap(([santaId, id]) => {
      const name = names.get(id);
      return name ? [[santaId, name] as const] : [];
    }),
  );
};

/**
 * The events I am a member or an organiser of.
 * @param db - The database.
 * @param account - Me.
 * @returns Their ids.
 */
export const myPartyIds = async (
  db: Db,
  account: AccountRow,
): Promise<string[]> => {
  const [mine, organised] = await Promise.all([
    db
      .select({ partyId: persons.partyId })
      .from(persons)
      .where(eq(persons.email, account.email)),
    db
      .select({ partyId: partyOrganisers.partyId })
      .from(partyOrganisers)
      .where(eq(partyOrganisers.accountId, account.id)),
  ]);
  return [...new Set([...mine, ...organised].map((row) => row.partyId))];
};

/** A line of « Les événements passés », or of « Les années passées ». */
export type PastYearLine = {
  slug: string;
  name: string;
  category: PartyCategory;
  iconEmoji: string | null;
  year: number;
  date: string | null;
  deed: PastDeed;
  /** A birthday: whom it is for, their age that year (ticket 118). */
  forWhom: ForWhom | null;
};

/**
 * The years over of some events, each with what I did there.
 * @param db - The database.
 * @param input - Me, the key of the draws, the events.
 * @returns One line per event and year over.
 */
export const loadPastLines = async (
  db: Db,
  input: {
    account: AccountRow;
    dataKey: CryptoKey;
    parties: readonly PartyRow[];
    /** Leaves out a year still shown (the page of an event over). */
    except?: { partyId: string; year: number };
  },
): Promise<PastYearLine[]> => {
  const { account, except } = input;
  const ids = input.parties.map((party) => party.id);
  if (ids.length === 0) return [];
  const loaded = await loadYears(db, ids);
  const over = input.parties.flatMap((party) =>
    timelineOf(party, loaded)
      .past.filter(
        (year) => !(except?.partyId === party.id && except.year === year.year),
      )
      .map((year) => ({ party, ...year })),
  );
  if (over.length === 0) return [];
  const lists = await loadPartyLists(db, ids);
  const held = await heldAmong(
    db,
    account.id,
    lists.map((list) => list.id),
  );
  const santaIds = over.flatMap(
    ({ party, year }) =>
      loaded
        .find((row) => row.partyId === party.id && row.year === year)
        ?.santas.map((santa) => santa.id) ?? [],
  );
  const [receivers, counts] = await Promise.all([
    myReceivers(db, account, santaIds, input.dataKey),
    listCounts(
      db,
      account.id,
      lists.map((list) => list.id),
      held,
    ),
  ]);
  const forWhom = await loadForWhom(db, input.parties);
  const deeds = deedsOf({
    years: over.map(({ party, year }) => ({ partyId: party.id, year })),
    loaded,
    receivers,
    lists,
    held,
    counts,
  });
  return over.map(({ party, year, date }) => ({
    slug: party.slug,
    name: party.name,
    category: party.category,
    iconEmoji: party.iconEmoji,
    year,
    date,
    deed: deeds.get(yearKey(party.id, year)) ?? null,
    forWhom: forWhom(party, year, account.id),
  }));
};

/**
 * « Les événements passés » (V3FetesPassees): every year over of my
 * events, an event that comes back once per year.
 * @param db - The database.
 * @param account - Me.
 * @param dataKey - The key of the draws.
 * @returns One line per event and year over.
 */
export const loadPastEvents = async (
  db: Db,
  account: AccountRow,
  dataKey: CryptoKey,
): Promise<PastYearLine[]> => {
  const ids = await myPartyIds(db, account);
  if (ids.length === 0) return [];
  const rows = await db.select().from(parties).where(inArray(parties.id, ids));
  return loadPastLines(db, { account, dataKey, parties: rows });
};

/** A year over of an event, as its page shows it (V3FeteAnneePassee). */
export type PastYearPage = {
  party: {
    slug: string;
    name: string;
    category: PartyCategory;
    iconEmoji: string | null;
    /** A birthday: whom it is for, their age that year (ticket 118). */
    forWhom: ForWhom | null;
  };
  year: number;
  date: string | null;
  /** Its Secret Santa I took part in or organised. */
  secretSantas: {
    id: string;
    label: string;
    /** My page, or the organiser's. */
    to: string | null;
    /** Whom I gave to: mine alone, for a year over. */
    gaveTo: string | null;
    /** « Devine qui », when it was played: its palmarès. */
    game: string | null;
  }[];
  lists: {
    id: string;
    mine: boolean;
    owner: { firstName: string; avatar: Avatar } | null;
    to: string;
    /** Its title, as on the page of the event (lignes.md). */
    title: LinePart;
    /**
     * For a list I held, whom it was for (« Léo, Zoé et moi »), or its
     * ideas (ticket 112).
     */
    held: LinePart | null;
    /** The gifts I ticked on another. */
    offered: number;
  }[];
};

/**
 * The page of a year over of an event, read only: its Secret Santa, its
 * game, its lists.
 * @param db - The database.
 * @param input - The event, my account, my role, the year, the key.
 * @returns The page, or null when that year is not over.
 */
export const loadPastYear = async (
  db: Db,
  input: {
    party: PartyRow;
    account: AccountRow;
    role: 'organiser' | 'member';
    year: number;
    dataKey: CryptoKey;
  },
): Promise<PastYearPage | null> => {
  const { party, account, role, year, dataKey } = input;
  const loaded: LoadedYear[] = await loadYears(db, [party.id]);
  const over = timelineOf(party, loaded).past.find((row) => row.year === year);
  if (!over) return null;
  const santas = loaded.find((row) => row.year === year)?.santas ?? [];
  const [people, mine, games] = await Promise.all([
    db.select().from(persons).where(eq(persons.partyId, party.id)),
    db
      .select({
        secretSantaId: participations.secretSantaId,
        tokenEnc: participations.tokenEnc,
        tokenIv: participations.tokenIv,
      })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(
        and(
          eq(persons.email, account.email),
          inArray(
            participations.secretSantaId,
            anyOf(santas.map((santa) => santa.id)),
          ),
        ),
      ),
    db
      .select({ id: secretSantas.id, guessMode: secretSantas.guessMode })
      .from(secretSantas)
      .where(inArray(secretSantas.id, anyOf(santas.map((santa) => santa.id)))),
  ]);
  const paths = new Map(
    await Promise.all(
      mine.map(async (row) => {
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
  const receivers = await myReceivers(
    db,
    account,
    santas.map((santa) => santa.id),
    dataKey,
  );
  const lists = (await loadPartyLists(db, [party.id])).filter(
    (list) => list.year === year,
  );
  const held = await heldAmong(
    db,
    account.id,
    lists.map((list) => list.id),
  );
  const shown = lists.filter(
    (list) => list.visibility === 'party' || held.has(list.id),
  );
  const counts = await listCounts(
    db,
    account.id,
    shown.map((list) => list.id),
    held,
  );
  const owners =
    shown.length === 0
      ? []
      : await db
          .select({ id: accounts.id, email: accounts.email })
          .from(accounts)
          .where(
            inArray(
              accounts.id,
              shown.map((list) => list.accountId),
            ),
          );
  const distinct = [...new Map(shown.map((list) => [list.id, list])).values()];
  const forWhom = await loadForWhom(db, [party]);
  const lines = await loadLines(
    db,
    {
      accountId: account.id,
      persons: [],
      santas: [],
      lists: distinct.map((list) => ({ id: list.id, partyId: party.id })),
    },
    nowIso(),
  );
  return {
    party: {
      slug: party.slug,
      name: party.name,
      category: party.category,
      iconEmoji: party.iconEmoji,
      forWhom: forWhom(party, year, account.id),
    },
    year,
    date: over.date,
    secretSantas: santas
      .filter((santa) => role === 'organiser' || paths.has(santa.id))
      .map((santa) => {
        const own = paths.get(santa.id) ?? null;
        const played =
          games.find((game) => game.id === santa.id)?.guessMode !== 'none';
        const organiserPath = `/admin/${party.slug}/editions/${santa.id}`;
        return {
          id: santa.id,
          label: santa.label,
          to: own ?? (role === 'organiser' ? organiserPath : null),
          gaveTo: receivers.get(santa.id) ?? null,
          game: played
            ? own
              ? `${own}/devine/palmares`
              : `${organiserPath}/palmares`
            : null,
        };
      }),
    lists: distinct.map((list) => {
      const line = lines.lists.get(listKey(list.id, party.id));
      const email = owners.find((row) => row.id === list.accountId)?.email;
      const person = people.find((row) => row.email === email);
      return {
        id: list.id,
        mine: held.has(list.id),
        owner: person
          ? { firstName: person.firstName, avatar: avatarOf(person) }
          : null,
        to: held.has(list.id)
          ? `/listes/${list.id}`
          : `/l/${list.shareToken}?depuis=${party.slug}`,
        title: line?.title ?? { key: 'lines.list.mine' },
        held: held.has(list.id) ? (line?.line.parts[0] ?? null) : null,
        offered: counts.offered.get(list.id) ?? 0,
      };
    }),
  };
};
