import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import type { Db } from './client';
import {
  giftListHolders,
  giftListParties,
  giftLists,
  news,
  noteDismissals,
  participations,
  parties,
  partyOrganisers,
  persons,
  type AccountRow,
} from './schema';
import { loadYears, timelineOf } from './years';
import { decrypt } from '#server/utils/crypto';
import type { PartyCategory } from '#shared/utils/categories';
import {
  appNotes,
  isoOfSqlite,
  noteFor,
  type AppNote,
} from '#shared/utils/appNote';
import {
  forgetBefore,
  listSection,
  newsSections,
  type NewsKind,
} from '#shared/utils/news';

// « Quoi de neuf » (ticket 120, V3QuoiDeNeuf): my news of the last thirty
// days, a section per event, each with the place it opens. Reading the
// page marks nothing as seen. Never a result of a draw, never who asks
// for ideas: the news do not hold them.

/** How many news the page shows at most. */
const NEWS_MAX = 100;

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/** A line of « Quoi de neuf ». */
export type NewsLine = {
  id: string;
  kind: NewsKind;
  count: number;
  name: string | null;
  detail: string | null;
  at: string;
  seen: boolean;
  to: string | null;
};

/** A section of « Quoi de neuf »: an event, or a public list. */
export type NewsSection = {
  key: string;
  title: string;
  category: PartyCategory | null;
  emoji: string | null;
  news: NewsLine[];
};

export type NewsPage = { sections: NewsSection[]; note: AppNote | null };

/**
 * When the V3 went out: the day its first migration was applied, as D1
 * keeps it (`d1_migrations`, written by `wrangler d1 migrations apply`).
 * Null where that table does not exist (the tests on node:sqlite).
 * @param db - The database.
 * @returns The instant (ISO), or null.
 */
export const switchedAt = async (db: Db): Promise<string | null> => {
  const rows = await db
    .all<{ at: string }>(
      sql`SELECT applied_at AS at FROM d1_migrations WHERE name = '0034_v3_parties.sql'`,
    )
    .catch(() => []);
  return isoOfSqlite(rows[0]?.at);
};

/**
 * Whether an account held, before an instant, a list shared by its link
 * (its own, or one it holds with others) that still is.
 * @param db - The database.
 * @param accountId - The account.
 * @param before - The instant (ISO).
 * @returns True when it did.
 */
const heldLinkListBefore = async (
  db: Db,
  accountId: string,
  before: string,
): Promise<boolean> => {
  const rows = await db.all<{ id: string }>(sql`
    SELECT l.id FROM gift_lists l
    WHERE l.shared_at IS NOT NULL AND l.shared_at < ${before}
      AND (l.account_id = ${accountId} OR l.id IN (
        SELECT list_id FROM gift_list_holders WHERE account_id = ${accountId}
      ))
    LIMIT 1`);
  return rows.length > 0;
};

/**
 * The word of the app for an account (ticket 113): the one of the switch
 * to the V3 for the accounts created before it, with its sentence on the
 * lists shared by link for those who held one.
 * @param db - The database.
 * @param account - The account.
 * @param dismissed - The ids of the words it closed.
 * @returns The word, or null.
 */
const wordOf = async (
  db: Db,
  account: AccountRow,
  dismissed: string[],
): Promise<AppNote | null> => {
  const notes = appNotes(await switchedAt(db));
  const first = noteFor({ ...account, heldLinkList: false }, dismissed, notes);
  if (!first) return null;
  const rule = notes.find((note) => note.id === first.id);
  if (!rule?.linkKey) return first;
  const held = await heldLinkListBefore(
    db,
    account.id,
    rule.createdBefore ?? '9999-12-31',
  );
  return noteFor({ ...account, heldLinkList: held }, dismissed, notes);
};

/**
 * « Quoi de neuf » for an account.
 * @param db - The database.
 * @param account - Me.
 * @param dataKey - The key of the personal links.
 * @param now - Now (ISO).
 * @returns The sections, and the word of the app.
 */
export const loadNewsPage = async (
  db: Db,
  account: AccountRow,
  dataKey: CryptoKey,
  now: string,
): Promise<NewsPage> => {
  const [rows, mine, organised, dismissed] = await Promise.all([
    db
      .select()
      .from(news)
      .where(
        and(
          eq(news.accountId, account.id),
          gte(news.createdAt, forgetBefore(now)),
        ),
      )
      .orderBy(desc(news.updatedAt))
      .limit(NEWS_MAX),
    db
      .select({ id: persons.id, partyId: persons.partyId })
      .from(persons)
      .where(eq(persons.email, account.email)),
    db
      .select({ partyId: partyOrganisers.partyId })
      .from(partyOrganisers)
      .where(eq(partyOrganisers.accountId, account.id)),
    db
      .select({ noteId: noteDismissals.noteId })
      .from(noteDismissals)
      .where(eq(noteDismissals.accountId, account.id)),
  ]);
  const note = await wordOf(
    db,
    account,
    dismissed.map((row) => row.noteId),
  );
  if (rows.length === 0) return { sections: [], note };
  const listIds = rows
    .filter((row) => row.targetType === 'list')
    .map((row) => row.targetId);
  const santaIds = rows
    .filter((row) => row.targetType === 'santa' || row.targetType === 'game')
    .map((row) => row.targetId);
  const [lists, listEvents, held, taking] = await Promise.all([
    db
      .select({
        id: giftLists.id,
        title: giftLists.title,
        iconEmoji: giftLists.iconEmoji,
        shareToken: giftLists.shareToken,
      })
      .from(giftLists)
      .where(inArray(giftLists.id, anyOf(listIds))),
    db
      .select({
        listId: giftListParties.listId,
        partyId: giftListParties.partyId,
      })
      .from(giftListParties)
      .where(inArray(giftListParties.listId, anyOf(listIds))),
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
        and(
          inArray(participations.secretSantaId, anyOf(santaIds)),
          inArray(participations.personId, anyOf(mine.map((row) => row.id))),
        ),
      ),
  ]);
  const myParties = new Set([
    ...mine.map((row) => row.partyId),
    ...organised.map((row) => row.partyId),
  ]);
  const partyIds = [
    ...new Set([
      ...rows.flatMap((row) => (row.partyId ? [row.partyId] : [])),
      ...listEvents
        .filter((row) => myParties.has(row.partyId))
        .map((row) => row.partyId),
    ]),
  ];
  const [events, years] = await Promise.all([
    db
      .select()
      .from(parties)
      .where(inArray(parties.id, anyOf(partyIds))),
    loadYears(db, partyIds),
  ]);
  const today = now.slice(0, 10);
  const dates = new Map(
    events.map((party) => [
      party.id,
      timelineOf(party, years, today).current?.date ?? null,
    ]),
  );
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
  const heldLists = new Set(held.map((row) => row.listId));
  /** Where a news goes: an event, or the list itself. */
  const sectionOf = (row: (typeof rows)[number]): string => {
    if (row.targetType !== 'list') return row.partyId ?? '';
    const partyId = listSection(
      listEvents
        .filter(
          (one) => one.listId === row.targetId && myParties.has(one.partyId),
        )
        .map((one) => ({
          partyId: one.partyId,
          date: dates.get(one.partyId) ?? null,
        })),
      today,
    );
    return partyId ?? `list:${row.targetId}`;
  };
  /** What a news opens. */
  const toOf = (row: (typeof rows)[number]): string | null => {
    const party = events.find((one) => one.id === row.partyId);
    switch (row.targetType) {
      case 'santa':
        return paths.get(row.targetId) ?? null;
      case 'game': {
        const path = paths.get(row.targetId);
        return path ? `${path}/devine/palmares` : null;
      }
      case 'follow':
        return party ? `/admin/${party.slug}/editions/${row.targetId}` : null;
      case 'party':
        return party ? `/e/${party.slug}/membres` : null;
      case 'list': {
        const list = lists.find((one) => one.id === row.targetId);
        if (!list) return null;
        return heldLists.has(list.id) || row.kind === 'list_invite'
          ? `/listes/${list.id}`
          : `/l/${list.shareToken}`;
      }
    }
  };
  const sectioned = rows
    // A list gone, a Secret Santa gone: their news go with them.
    .filter(
      (row) =>
        row.targetType !== 'list' ||
        lists.some((list) => list.id === row.targetId),
    )
    .map((row) => ({
      id: row.id,
      kind: row.kind,
      count: row.count,
      name: row.name,
      detail: row.detail,
      at: row.updatedAt,
      seen: Boolean(row.seenAt),
      to: toOf(row),
      section: sectionOf(row),
    }));
  return {
    note,
    sections: newsSections(sectioned).map(({ section, news: lines }) => {
      const party = events.find((one) => one.id === section);
      const list = lists.find((one) => `list:${one.id}` === section);
      return {
        key: section,
        title: party?.name ?? list?.title ?? '',
        category: party?.category ?? null,
        emoji: party ? party.iconEmoji : (list?.iconEmoji ?? null),
        news: lines.map(({ section: _section, ...line }) => line),
      };
    }),
  };
};
