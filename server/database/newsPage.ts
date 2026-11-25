import { and, desc, eq, gte, inArray, isNull, or } from 'drizzle-orm';
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
  type NewsRow,
} from './schema';
import { loadYears, timelineOf } from './years';
import { decrypt } from '#server/utils/crypto';
import type { PartyCategory } from '#shared/utils/categories';
import { noteFor, type AppNote } from '#shared/utils/appNote';
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
  /** The event's address, for the summary by email; null for a list. */
  slug: string | null;
  category: PartyCategory | null;
  emoji: string | null;
  news: NewsLine[];
};

export type NewsPage = { sections: NewsSection[]; note: AppNote | null };

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
  const [rows, dismissed] = await Promise.all([
    db
      .select()
      .from(news)
      .where(
        and(
          eq(news.accountId, account.id),
          // Not seen yet, or seen less than thirty days ago (ticket 142).
          or(isNull(news.seenAt), gte(news.seenAt, forgetBefore(now))),
        ),
      )
      .orderBy(desc(news.updatedAt))
      .limit(NEWS_MAX),
    db
      .select({ noteId: noteDismissals.noteId })
      .from(noteDismissals)
      .where(eq(noteDismissals.accountId, account.id)),
  ]);
  const note = noteFor(
    account,
    dismissed.map((row) => row.noteId),
  );
  const sections = await newsSectionsOf(db, [account], rows, dataKey, now);
  return { note, sections: sections.get(account.id) ?? [] };
};

/**
 * The news of some accounts in their sections, each with the place it
 * opens: « Quoi de neuf » for one, the emails of the morning for several
 * at once (ticket 121), in the same few queries.
 * @param db - The database.
 * @param owners - The accounts.
 * @param rows - Their news, the latest first.
 * @param dataKey - The key of the personal links.
 * @param now - Now (ISO).
 * @returns The sections of each account, by its id.
 */
export const newsSectionsOf = async (
  db: Db,
  owners: readonly Pick<AccountRow, 'id' | 'email'>[],
  rows: readonly NewsRow[],
  dataKey: CryptoKey,
  now: string,
): Promise<Map<string, NewsSection[]>> => {
  if (rows.length === 0) return new Map();
  const accountIds = owners.map((owner) => owner.id);
  const listIds = rows
    .filter((row) => row.targetType === 'list')
    .map((row) => row.targetId);
  const santaIds = rows
    .filter((row) => row.targetType === 'santa' || row.targetType === 'game')
    .map((row) => row.targetId);
  const [mine, organised, lists, listEvents, held] = await Promise.all([
    db
      .select({
        id: persons.id,
        partyId: persons.partyId,
        email: persons.email,
      })
      .from(persons)
      .where(inArray(persons.email, anyOf(owners.map((owner) => owner.email)))),
    db
      .select({
        partyId: partyOrganisers.partyId,
        accountId: partyOrganisers.accountId,
      })
      .from(partyOrganisers)
      .where(inArray(partyOrganisers.accountId, anyOf(accountIds))),
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
      .select({
        listId: giftListHolders.listId,
        accountId: giftListHolders.accountId,
      })
      .from(giftListHolders)
      .where(
        and(
          inArray(giftListHolders.accountId, anyOf(accountIds)),
          inArray(giftListHolders.listId, anyOf(listIds)),
        ),
      ),
  ]);
  const taking = await db
    .select({
      secretSantaId: participations.secretSantaId,
      personId: participations.personId,
      tokenEnc: participations.tokenEnc,
      tokenIv: participations.tokenIv,
    })
    .from(participations)
    .where(
      and(
        inArray(participations.secretSantaId, anyOf(santaIds)),
        inArray(participations.personId, anyOf(mine.map((row) => row.id))),
      ),
    );
  const partiesOf = new Map(
    owners.map((owner) => [
      owner.id,
      new Set([
        ...mine
          .filter((row) => row.email === owner.email)
          .map((row) => row.partyId),
        ...organised
          .filter((row) => row.accountId === owner.id)
          .map((row) => row.partyId),
      ]),
    ]),
  );
  const allMine = new Set([...partiesOf.values()].flatMap((set) => [...set]));
  const partyIds = [
    ...new Set([
      ...rows.flatMap((row) => (row.partyId ? [row.partyId] : [])),
      ...listEvents
        .filter((row) => allMine.has(row.partyId))
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
  // The personal page of a Secret Santa, for whoever takes part in it.
  const paths = new Map(
    await Promise.all(
      taking.map(async (row) => {
        const token = await decrypt(
          { enc: row.tokenEnc, iv: row.tokenIv },
          dataKey,
        );
        const email = mine.find((one) => one.id === row.personId)?.email;
        return [
          `${email}|${row.secretSantaId}`,
          token.ok ? `/p/${token.value}` : null,
        ] as const;
      }),
    ),
  );
  return new Map(
    owners.map((owner) => {
      const myParties = partiesOf.get(owner.id) ?? new Set<string>();
      const heldLists = new Set(
        held
          .filter((row) => row.accountId === owner.id)
          .map((row) => row.listId),
      );
      /** Where a news goes: an event, or the list itself. */
      const sectionOf = (row: NewsRow): string => {
        if (row.targetType !== 'list') return row.partyId ?? '';
        const partyId = listSection(
          listEvents
            .filter(
              (one) =>
                one.listId === row.targetId && myParties.has(one.partyId),
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
      const toOf = (row: NewsRow): string | null => {
        const party = events.find((one) => one.id === row.partyId);
        switch (row.targetType) {
          case 'santa':
            return paths.get(`${owner.email}|${row.targetId}`) ?? null;
          case 'game': {
            const path = paths.get(`${owner.email}|${row.targetId}`);
            if (!path) return null;
            return row.kind === 'game_open'
              ? `${path}/devine`
              : `${path}/devine/palmares`;
          }
          case 'follow':
            return party
              ? `/admin/${party.slug}/editions/${row.targetId}`
              : null;
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
        .filter((row) => row.accountId === owner.id)
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
      return [
        owner.id,
        newsSections(sectioned).map(({ section, news: lines }) => {
          const party = events.find((one) => one.id === section);
          const list = lists.find((one) => `list:${one.id}` === section);
          return {
            key: section,
            title: party?.name ?? list?.title ?? '',
            slug: party?.slug ?? null,
            category: party?.category ?? null,
            emoji: party ? party.iconEmoji : (list?.iconEmoji ?? null),
            news: lines.map(({ section: _section, ...line }) => line),
          };
        }),
      ] as const;
    }),
  );
};
