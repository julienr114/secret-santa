import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  inArray,
  isNotNull,
  ne,
  or,
} from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  giftClaims,
  giftListHolders,
  giftListIdeas,
  giftListParties,
  giftLists,
  giftOffList,
  parties,
  partyOrganisers,
  participations,
  partyYears,
  persons,
  secretSantas,
} from './schema';
import { newId, nowIso } from '#server/http/context';
import {
  listStage,
  type Audience,
  type ListStage,
} from '#server/utils/listSharing';
import { partyEmoji, type PartyCategory } from '#shared/utils/categories';
import { listYear } from '#shared/utils/years';
import { loadYears, timelineOf } from './years';

// The sharing of a list by stages (docs/spec/v3/listes.md, ticket 106):
// draft, the members of one or several events, public. Who gets in is
// decided on arrival on its address.

/**
 * Whether an account is a member, or an organiser, of an event the list
 * is shared in with all its members.
 * @param db - The database.
 * @param listId - The list.
 * @param account - Its id and its address.
 * @param account.id - The account.
 * @param account.email - Its address, as the members carry it.
 * @returns True when one of these events opens the list to them.
 */
export const memberWhereShared = async (
  db: Db,
  listId: string,
  account: { id: string; email: string },
): Promise<boolean> => {
  const member = db
    .select({ id: persons.id })
    .from(persons)
    .where(
      and(
        eq(persons.partyId, giftListParties.partyId),
        eq(persons.email, account.email),
        eq(persons.active, true),
      ),
    );
  const organiser = db
    .select({ id: partyOrganisers.partyId })
    .from(partyOrganisers)
    .where(
      and(
        eq(partyOrganisers.partyId, giftListParties.partyId),
        eq(partyOrganisers.accountId, account.id),
      ),
    );
  const [found] = await db
    .select({ id: giftListParties.id })
    .from(giftListParties)
    .where(
      and(
        eq(giftListParties.listId, listId),
        eq(giftListParties.visibility, 'party'),
        or(exists(member), exists(organiser)),
      ),
    )
    .limit(1);
  return Boolean(found);
};

/**
 * The event's current year (ticket 108): the one the home shows, else
 * its last one; with its id once it exists.
 * @param db - The database.
 * @param partyId - The event.
 * @returns Its year and date, or null when it has none.
 */
export const currentYearOf = async (db: Db, partyId: string) => {
  const [party] = await db
    .select({
      id: parties.id,
      recurring: parties.recurring,
      usualDate: parties.usualDate,
    })
    .from(parties)
    .where(eq(parties.id, partyId))
    .limit(1);
  if (!party) return null;
  const years = await loadYears(db, [partyId]);
  const timeline = timelineOf(party, years);
  const current = timeline.current ?? timeline.past[0] ?? null;
  return current
    ? { ...current, id: years.find((row) => row.year === current.year)?.id }
    : null;
};

/**
 * The date of an event's current year: what a list made for it takes, the
 * year to come once the last one is over (ticket 108). That year gets its
 * row if it has none yet: its lists belong to it.
 * @param db - The database.
 * @param party - The event.
 * @param party.id - Its id.
 * @returns The ISO day, or null when its year has none.
 */
export const occasionDate = async (
  db: Db,
  party: { id: string },
): Promise<string | null> => {
  const current = await currentYearOf(db, party.id);
  if (!current) return null;
  if (!current.id) {
    await db
      .insert(partyYears)
      .values({
        id: newId(),
        partyId: party.id,
        year: current.year,
        date: current.date,
        createdAt: nowIso(),
      })
      .onConflictDoNothing();
  }
  return current.date;
};

/** An event the list is shared in, or may be, as « Qui verra ta liste ? » shows it. */
export type SharingOption = {
  id: string;
  slug: string;
  name: string;
  category: PartyCategory;
  emoji: string | null;
  /** Its active members. */
  members: number;
  /** All its members see it. */
  shared: boolean;
  /** « Celui qui m'a tiré » there (ticket 139): my part of the list
   * serves my Secret Santa, with or without all the members. */
  giver: boolean;
  /** I take part there in a Secret Santa not closed: « Celui qui m'a
   * tiré » may be chosen. */
  drawn: boolean;
};

/**
 * The events a list is shared in (its own aside), with how.
 * @param db - The database.
 * @param listId - The list.
 * @returns One row per event.
 */
export const sharedEventsOf = (db: Db, listId: string) =>
  db
    .select({
      id: parties.id,
      name: parties.name,
      visibility: giftListParties.visibility,
      giver: giftListParties.giver,
    })
    .from(giftListParties)
    .innerJoin(parties, eq(parties.id, giftListParties.partyId))
    .where(and(eq(giftListParties.listId, listId), eq(parties.fromList, false)))
    // In the order they were shared in; saved together, by name.
    .orderBy(asc(giftListParties.createdAt), asc(parties.name));

/**
 * Who gets in under a sharing, holders aside: the addresses of the active
 * members of the events, their organisers, or everyone.
 * @param db - The database.
 * @param partyIds - The events shared with all their members.
 * @param isPublic - Whether anyone with the link gets in.
 * @returns The audience.
 */
export const audienceOf = async (
  db: Db,
  partyIds: readonly string[],
  isPublic: boolean,
): Promise<Audience> => {
  if (partyIds.length === 0) {
    return { isPublic, emails: new Set(), accountIds: new Set() };
  }
  const [members, organisers] = await Promise.all([
    db
      .select({ email: persons.email })
      .from(persons)
      .where(
        and(inArray(persons.partyId, [...partyIds]), eq(persons.active, true)),
      ),
    db
      .select({ id: partyOrganisers.accountId })
      .from(partyOrganisers)
      .where(inArray(partyOrganisers.partyId, [...partyIds])),
  ]);
  return {
    isPublic,
    emails: new Set(members.flatMap((m) => (m.email ? [m.email] : []))),
    accountIds: new Set(organisers.map((o) => o.id)),
  };
};

/**
 * Those who ticked or offered something on a list.
 * @param db - The database.
 * @param listId - The list.
 * @returns Their accounts, once each.
 */
export const claimersOf = async (db: Db, listId: string) => {
  const rows = await db
    .selectDistinct({ id: accounts.id, email: accounts.email })
    .from(accounts)
    .where(
      or(
        exists(
          db
            .select({ id: giftClaims.id })
            .from(giftClaims)
            .where(
              and(
                eq(giftClaims.listId, listId),
                eq(giftClaims.accountId, accounts.id),
              ),
            ),
        ),
        exists(
          db
            .select({ id: giftOffList.id })
            .from(giftOffList)
            .where(
              and(
                eq(giftOffList.listId, listId),
                eq(giftOffList.accountId, accounts.id),
              ),
            ),
        ),
      ),
    );
  return rows;
};

/**
 * How many people see a list through its events: their active members,
 * once each, its holders aside.
 * @param db - The database.
 * @param partyIds - The events shared with all their members.
 * @param holderEmails - The addresses of its holders.
 * @returns The count.
 */
export const membersSeeing = async (
  db: Db,
  partyIds: readonly string[],
  holderEmails: readonly string[],
): Promise<number> => {
  if (partyIds.length === 0) return 0;
  const rows = await db
    .select({ id: persons.id, email: persons.email })
    .from(persons)
    .where(
      and(inArray(persons.partyId, [...partyIds]), eq(persons.active, true)),
    );
  const people = new Set(
    rows
      .filter((row) => !row.email || !holderEmails.includes(row.email))
      .map((row) => row.email ?? row.id),
  );
  return people.size;
};

/**
 * The events « Qui verra ta liste ? » offers: those I belong to, and
 * those the list is already shared in, each with its members.
 * @param db - The database.
 * @param listId - The list.
 * @param account - Me.
 * @param account.id - My account.
 * @param account.email - My address.
 * @returns The events, by name.
 */
export const sharingOptions = async (
  db: Db,
  listId: string,
  account: { id: string; email: string },
): Promise<SharingOption[]> => {
  const shared = await sharedEventsOf(db, listId);
  const mine = await db
    .select({ id: parties.id })
    .from(parties)
    .where(
      and(
        eq(parties.fromList, false),
        or(
          exists(
            db
              .select({ id: persons.id })
              .from(persons)
              .where(
                and(
                  eq(persons.partyId, parties.id),
                  eq(persons.email, account.email),
                  eq(persons.active, true),
                ),
              ),
          ),
          exists(
            db
              .select({ id: partyOrganisers.partyId })
              .from(partyOrganisers)
              .where(
                and(
                  eq(partyOrganisers.partyId, parties.id),
                  eq(partyOrganisers.accountId, account.id),
                ),
              ),
          ),
        ),
      ),
    );
  const ids = [
    ...new Set([...mine.map((p) => p.id), ...shared.map((p) => p.id)]),
  ];
  if (ids.length === 0) return [];
  const [rows, counts] = await Promise.all([
    db.select().from(parties).where(inArray(parties.id, ids)),
    db
      .select({ partyId: persons.partyId, n: count() })
      .from(persons)
      .where(and(inArray(persons.partyId, ids), eq(persons.active, true)))
      .groupBy(persons.partyId),
  ]);
  const members = new Map(counts.map((row) => [row.partyId, row.n]));
  const checked = new Set(
    shared.filter((row) => row.visibility === 'party').map((row) => row.id),
  );
  const givers = new Set(
    shared.filter((row) => row.giver).map((row) => row.id),
  );
  const drawn = new Set(
    (
      await db
        .select({ partyId: secretSantas.partyId })
        .from(participations)
        .innerJoin(persons, eq(persons.id, participations.personId))
        .innerJoin(
          secretSantas,
          eq(secretSantas.id, participations.secretSantaId),
        )
        .where(
          and(
            inArray(secretSantas.partyId, ids),
            eq(persons.email, account.email),
            ne(secretSantas.status, 'closed'),
          ),
        )
    ).map((row) => row.partyId),
  );
  return rows
    .map((party) => ({
      id: party.id,
      slug: party.slug,
      name: party.name,
      category: party.category,
      emoji: partyEmoji(party),
      members: members.get(party.id) ?? 0,
      shared: checked.has(party.id),
      giver: givers.has(party.id),
      drawn: drawn.has(party.id),
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

/**
 * Saves « Qui voit ta liste ? »: the events shared with all their
 * members, those where the one who drew me sees it (ticket 139: both may
 * be true of one event), and whether it is public. Its own event, which
 * holds only its holders, stays.
 * @param db - The database.
 * @param list - The list, with since when it is public.
 * @param sharing - What is asked.
 * @param sharing.partyIds - The events shared with all their members.
 * @param sharing.giverIds - The events of « Celui qui m'a tiré ».
 * @param sharing.isPublic - « Tout le monde ».
 * @param now - ISO date.
 * @returns Once saved.
 */
export const saveSharing = async (
  db: Db,
  list: { id: string; sharedAt: string | null },
  sharing: {
    partyIds: readonly string[];
    giverIds?: readonly string[];
    isPublic: boolean;
  },
  now: string,
) => {
  const shared = await sharedEventsOf(db, list.id);
  const givers = new Set(sharing.giverIds ?? []);
  const wanted = new Map(
    [...new Set([...givers, ...sharing.partyIds])].map((id) => [
      id,
      {
        visibility: sharing.partyIds.includes(id)
          ? ('party' as const)
          : ('giver' as const),
        giver: givers.has(id),
      },
    ]),
  );
  const dropped = shared
    .filter((row) => !wanted.has(row.id))
    .map((row) => row.id);
  const sharedAt = sharing.isPublic ? (list.sharedAt ?? now) : null;
  await db.batch([
    db
      .update(giftLists)
      .set({ sharedAt, updatedAt: now })
      .where(eq(giftLists.id, list.id)),
    db
      .delete(giftListParties)
      .where(
        and(
          eq(giftListParties.listId, list.id),
          inArray(giftListParties.partyId, dropped.length ? dropped : ['']),
        ),
      ),
    ...[...wanted].map(([partyId, { visibility, giver }]) =>
      db
        .insert(giftListParties)
        .values({
          id: newId(),
          listId: list.id,
          partyId,
          visibility,
          giver,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: [giftListParties.listId, giftListParties.partyId],
          set: { visibility, giver },
        }),
    ),
  ]);
};

/** A public list where I offer something, as « Ce que j'offre ailleurs » shows it. */
export type ElsewhereList = {
  token: string;
  title: string;
  iconEmoji: string;
  iconColor: string;
  eventDate: string | null;
  /** What I offer there: the ideas I ticked, the gifts I added. */
  gifts: string[];
};

/**
 * « Ce que j'offre ailleurs » (docs/spec/v3/listes.md, V3OffreAilleurs):
 * the public lists where I ticked or offered something without holding
 * them nor being a member of an event they are shared in. A list that
 * stops being public leaves it.
 * @param db - The database.
 * @param account - Me.
 * @param account.id - My account.
 * @param account.email - My address.
 * @returns The lists, the nearest day first.
 */
export const elsewhereOf = async (
  db: Db,
  account: { id: string; email: string },
): Promise<ElsewhereList[]> => {
  const [claimed, offered] = await Promise.all([
    db
      .select({ list: giftLists, text: giftListIdeas.text })
      .from(giftClaims)
      .innerJoin(giftLists, eq(giftLists.id, giftClaims.listId))
      .innerJoin(giftListIdeas, eq(giftListIdeas.id, giftClaims.ideaId))
      .where(
        and(
          eq(giftClaims.accountId, account.id),
          isNotNull(giftLists.sharedAt),
        ),
      ),
    db
      .select({ list: giftLists, text: giftOffList.text })
      .from(giftOffList)
      .innerJoin(giftLists, eq(giftLists.id, giftOffList.listId))
      .where(
        and(
          eq(giftOffList.accountId, account.id),
          isNotNull(giftLists.sharedAt),
        ),
      ),
  ]);
  const byList = [...claimed, ...offered].reduce<
    Map<string, { list: typeof giftLists.$inferSelect; gifts: string[] }>
  >((acc, row) => {
    const entry = acc.get(row.list.id) ?? { list: row.list, gifts: [] };
    return acc.set(row.list.id, {
      ...entry,
      gifts: [...entry.gifts, row.text],
    });
  }, new Map());
  const held = new Set(
    (
      await db
        .select({ listId: giftListHolders.listId })
        .from(giftListHolders)
        .where(eq(giftListHolders.accountId, account.id))
    ).map((row) => row.listId),
  );
  const kept = await Promise.all(
    [...byList.values()].map(async (entry) =>
      held.has(entry.list.id) ||
      (await memberWhereShared(db, entry.list.id, account))
        ? null
        : entry,
    ),
  );
  return kept
    .flatMap((entry) =>
      entry?.list.shareToken
        ? [
            {
              token: entry.list.shareToken,
              title: entry.list.title,
              iconEmoji: entry.list.iconEmoji,
              iconColor: entry.list.iconColor,
              eventDate: entry.list.eventDate,
              gifts: entry.gifts,
            },
          ]
        : [],
    )
    .toSorted((a, b) =>
      (a.eventDate ?? '9999').localeCompare(b.eventDate ?? '9999'),
    );
};

/**
 * The active members of some events.
 * @param db - The database.
 * @param partyIds - The events.
 * @returns Their ids and addresses.
 */
export const membersOf = async (db: Db, partyIds: readonly string[]) =>
  partyIds.length === 0
    ? []
    : db
        .select({ id: persons.id, email: persons.email })
        .from(persons)
        .where(
          and(
            inArray(persons.partyId, [...partyIds]),
            eq(persons.active, true),
          ),
        );

/**
 * The list I hold for an event: made for it, or shared in it; the most
 * recently changed.
 * @param db - The database.
 * @param accountId - My account.
 * @param partyId - The event.
 * @returns The list, with since when it is public, or null.
 */
export const findMyListFor = async (
  db: Db,
  accountId: string,
  partyId: string,
) => {
  const held = await db
    .select({
      id: giftLists.id,
      sharedAt: giftLists.sharedAt,
      eventDate: giftLists.eventDate,
      createdAt: giftLists.createdAt,
    })
    .from(giftListHolders)
    .innerJoin(giftLists, eq(giftLists.id, giftListHolders.listId))
    .leftJoin(
      giftListParties,
      and(
        eq(giftListParties.listId, giftLists.id),
        eq(giftListParties.partyId, partyId),
      ),
    )
    .where(
      and(
        eq(giftListHolders.accountId, accountId),
        or(
          eq(giftLists.partyId, partyId),
          eq(giftListParties.partyId, partyId),
        ),
      ),
    )
    .orderBy(desc(giftLists.updatedAt));
  if (held.length === 0) return null;
  // A list of a year over stays there (ticket 108).
  const current = await currentYearOf(db, partyId);
  const list = held.find((row) => !current || listYear(row) >= current.year);
  return list ? { id: list.id, sharedAt: list.sharedAt } : null;
};

/**
 * What the line « Ma liste de cadeaux » says, from my Secret Santa: the
 * stage of my list for the event, or null without one.
 * @param db - The database.
 * @param accountId - My account.
 * @param partyId - The event.
 * @returns The stage, or null.
 */
export const myListStage = async (
  db: Db,
  accountId: string,
  partyId: string,
): Promise<ListStage | null> => {
  const list = await findMyListFor(db, accountId, partyId);
  if (!list) return null;
  const events = await sharedEventsOf(db, list.id);
  return listStage({
    isPublic: list.sharedAt !== null,
    parties: events.filter((row) => row.visibility === 'party').length,
    givers: events.filter((row) => row.visibility === 'giver').length,
  });
};

/**
 * My list for an event, from my Secret Santa (ticket 107): one I hold
 * that is made for it or shared in it, else a new one, made for it and
 * kept for the one who drew me, with no draft in between
 * (docs/spec/v3/listes.md, « Une nouvelle liste »).
 * @param db - The database.
 * @param accountId - My account.
 * @param party - The event of the draw.
 * @param party.id - Its id.
 * @param party.name - Its name, which the list takes.
 * @param make - Makes the list when there is none: its id.
 * @param now - ISO date.
 * @returns The list's id.
 */
export const myListFor = async (
  db: Db,
  accountId: string,
  party: { id: string; name: string },
  make: () => Promise<string>,
  now: string,
): Promise<string> => {
  const held = await findMyListFor(db, accountId, party.id);
  if (held) return held.id;
  const id = await make();
  await saveSharing(
    db,
    { id, sharedAt: null },
    { partyIds: [], giverIds: [party.id], isPublic: false },
    now,
  );
  return id;
};

/**
 * Who wrote their list for an event (ticket 107, « a écrit sa liste »):
 * among these addresses, those whose account holds a list made for it or
 * shared in it with at least one idea. A yes or no, never what.
 * @param db - The database.
 * @param partyId - The event.
 * @param emails - The addresses of its participants.
 * @returns The addresses of those who wrote one.
 */
export const wroteListFor = async (
  db: Db,
  partyId: string,
  emails: readonly string[],
): Promise<Set<string>> => {
  if (emails.length === 0) return new Set();
  const rows = await db
    .selectDistinct({ email: accounts.email })
    .from(accounts)
    .innerJoin(giftListHolders, eq(giftListHolders.accountId, accounts.id))
    .innerJoin(giftLists, eq(giftLists.id, giftListHolders.listId))
    .leftJoin(
      giftListParties,
      and(
        eq(giftListParties.listId, giftLists.id),
        eq(giftListParties.partyId, partyId),
      ),
    )
    .where(
      and(
        inArray(accounts.email, [...emails]),
        or(
          eq(giftLists.partyId, partyId),
          eq(giftListParties.partyId, partyId),
        ),
        exists(
          db
            .select({ id: giftListIdeas.id })
            .from(giftListIdeas)
            .where(eq(giftListIdeas.listId, giftLists.id)),
        ),
      ),
    );
  return new Set(rows.map((row) => row.email));
};

/**
 * The accounts of the events a list is shared in with all their members
 * (« Cocher pour quelqu'un », ticket 098): its active members who have an
 * account, by their address, and its organisers. Those without an account
 * are not known to the app: nobody may give for them under their name.
 * @param db - The database.
 * @param listId - The list.
 * @returns Their accounts, once each.
 */
export const accountsWhereShared = async (db: Db, listId: string) => {
  const shared = db
    .select({ partyId: giftListParties.partyId })
    .from(giftListParties)
    .where(
      and(
        eq(giftListParties.listId, listId),
        eq(giftListParties.visibility, 'party'),
      ),
    );
  const [members, organisers] = await Promise.all([
    db
      .select({ account: accounts })
      .from(persons)
      .innerJoin(accounts, eq(accounts.email, persons.email))
      .where(and(inArray(persons.partyId, shared), eq(persons.active, true))),
    db
      .select({ account: accounts })
      .from(partyOrganisers)
      .innerJoin(accounts, eq(accounts.id, partyOrganisers.accountId))
      .where(inArray(partyOrganisers.partyId, shared)),
  ]);
  return [...members, ...organisers]
    .map((row) => row.account)
    .filter(
      (account, index, all) =>
        all.findIndex((other) => other.id === account.id) === index,
    );
};
