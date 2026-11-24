import { and, count, eq, inArray, isNull, lt } from 'drizzle-orm';
import type { Db } from './client';
import { accounts, news, partyOrganisers, persons } from './schema';
import { newId } from '#server/http/context';
import {
  forgetBefore,
  groupNews,
  NEWS_SHAPE,
  type EmailNews,
  type NewNews,
  type NewsKind,
  type NewsTarget,
} from '#shared/utils/news';

// The news of the accounts in the database (ticket 120): written where
// something happens, grouped in the day, seen by opening the thing,
// forgotten thirty days after they were seen, never before (ticket 142).
// A red dot is lit only by a news not seen yet: it always has its line in
// « Quoi de neuf ». Best effort: a news that cannot be written
// never stops the gesture that made it.

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/**
 * Writes news, each counted again with one of the same kind at the same
 * place not seen yet that day.
 * @param db - The database.
 * @param incoming - The news, one per account.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const addNews = async (
  db: Db,
  incoming: readonly NewNews[],
  now: string,
): Promise<void> => {
  if (incoming.length === 0) return;
  const pending = await db
    .select({
      id: news.id,
      accountId: news.accountId,
      kind: news.kind,
      targetId: news.targetId,
      count: news.count,
      createdAt: news.createdAt,
    })
    .from(news)
    .where(
      and(
        inArray(news.accountId, anyOf(incoming.map((one) => one.accountId))),
        inArray(news.targetId, anyOf(incoming.map((one) => one.targetId))),
        isNull(news.seenAt),
      ),
    );
  const { counted, added } = groupNews(pending, incoming, now);
  const statements = [
    ...counted.map((one) =>
      db
        .update(news)
        // Counted again, it may go by email again (ticket 121).
        .set({ count: one.count, updatedAt: now, emailedAt: null })
        .where(eq(news.id, one.id)),
    ),
    ...added.map((one) =>
      db.insert(news).values({
        id: newId(),
        accountId: one.accountId,
        kind: one.kind,
        level: NEWS_SHAPE[one.kind].level,
        targetType: NEWS_SHAPE[one.kind].target,
        targetId: one.targetId,
        partyId: one.partyId,
        name: one.name,
        detail: one.detail,
        count: one.count,
        mailable: one.mailable ?? true,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  ];
  const [head, ...rest] = statements;
  if (head) await db.batch([head, ...rest]);
};

/**
 * The same news for several accounts.
 * @param accountIds - Who is told.
 * @param base - The news.
 * @returns One news per account, once each.
 */
export const newsFor = (
  accountIds: readonly string[],
  base: Omit<NewNews, 'accountId' | 'name' | 'detail'> &
    Partial<Pick<NewNews, 'name' | 'detail'>>,
): NewNews[] =>
  [...new Set(accountIds)].map((accountId) => ({
    name: null,
    detail: null,
    ...base,
    accountId,
  }));

/**
 * Marks as seen what points at a thing: opening it is what makes its
 * news seen, never opening « Quoi de neuf ».
 * @param db - The database.
 * @param input - Who opened what.
 * @param input.accountId - Who.
 * @param input.target - The kind of place.
 * @param input.targetId - Which one.
 * @param input.kinds - Only these kinds, when given.
 * @param now - Now (ISO).
 * @returns Once marked.
 */
export const markSeen = async (
  db: Db,
  input: {
    accountId: string;
    target: NewsTarget;
    targetId: string;
    kinds?: readonly NewsKind[];
  },
  now: string,
): Promise<void> => {
  await db
    .update(news)
    .set({ seenAt: now })
    .where(
      and(
        eq(news.accountId, input.accountId),
        eq(news.targetType, input.target),
        eq(news.targetId, input.targetId),
        isNull(news.seenAt),
        input.kinds ? inArray(news.kind, [...input.kinds]) : undefined,
      ),
    );
};

/**
 * Marks as seen every news of a kind of an account: someone asked me for
 * ideas, and I wrote some.
 * @param db - The database.
 * @param accountId - Me.
 * @param kind - The kind.
 * @param now - Now (ISO).
 * @returns Once marked.
 */
export const markKindSeen = async (
  db: Db,
  accountId: string,
  kind: NewsKind,
  now: string,
): Promise<void> => {
  await db
    .update(news)
    .set({ seenAt: now })
    .where(
      and(
        eq(news.accountId, accountId),
        eq(news.kind, kind),
        isNull(news.seenAt),
      ),
    );
};

/**
 * Marks as seen what points at a thing, for whoever has the account of
 * an address: a personal page opened by its link is opened by that person.
 * @param db - The database.
 * @param email - The address of the person, if any.
 * @param target - The place.
 * @param targetId - Which one.
 * @param now - Now (ISO).
 * @param kinds - Only these kinds, when given.
 * @returns Once marked.
 */
export const markSeenByEmail = async (
  db: Db,
  email: string | null,
  target: NewsTarget,
  targetId: string,
  now: string,
  kinds?: readonly NewsKind[],
): Promise<void> => {
  if (!email) return;
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email.toLowerCase()))
    .limit(1);
  if (account) {
    await markSeen(db, { accountId: account.id, target, targetId, kinds }, now);
  }
};

/** A news not seen yet, as the lines read it. */
export type UnseenNews = {
  kind: NewsKind;
  targetType: NewsTarget;
  targetId: string;
  count: number;
};

/**
 * The news of an account not seen yet: never forgotten (ticket 142).
 * @param db - The database.
 * @param accountId - Me.
 * @returns The news.
 */
export const unseenNews = (db: Db, accountId: string): Promise<UnseenNews[]> =>
  db
    .select({
      kind: news.kind,
      targetType: news.targetType,
      targetId: news.targetId,
      count: news.count,
    })
    .from(news)
    .where(and(eq(news.accountId, accountId), isNull(news.seenAt)));

/**
 * How many news wait: the count on the tab « Quoi de neuf ».
 * @param db - The database.
 * @param accountId - Me.
 * @returns The number of lines not seen yet.
 */
export const countUnseen = async (
  db: Db,
  accountId: string,
): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(news)
    .where(and(eq(news.accountId, accountId), isNull(news.seenAt)));
  return row?.n ?? 0;
};

/**
 * Forgets the news seen more than thirty days ago (the morning task);
 * those not seen yet stay (ticket 142).
 * @param db - The database.
 * @param now - Now (ISO).
 * @returns Once done.
 */
export const forgetNews = async (db: Db, now: string): Promise<void> => {
  await db.delete(news).where(lt(news.seenAt, forgetBefore(now)));
};

/**
 * Forgets the news of things that are gone.
 * @param db - The database.
 * @param targetIds - The lists or Secret Santas deleted.
 * @returns The statement.
 */
export const deleteNewsOf = (db: Db, targetIds: readonly string[]) =>
  db.delete(news).where(inArray(news.targetId, anyOf(targetIds)));

/**
 * The accounts of these addresses.
 * @param db - The database.
 * @param emails - Addresses, any case.
 * @returns Their ids, by address (lower case).
 */
export const accountsOfEmails = async (
  db: Db,
  emails: readonly (string | null)[],
): Promise<Map<string, string>> => {
  const wanted = [
    ...new Set(emails.flatMap((email) => (email ? [email.toLowerCase()] : []))),
  ];
  if (wanted.length === 0) return new Map();
  const rows = await db
    .select({ id: accounts.id, email: accounts.email })
    .from(accounts)
    .where(inArray(accounts.email, wanted));
  return new Map(rows.map((row) => [row.email, row.id]));
};

/**
 * « Par email » of the accounts of some addresses (ticket 121): an email
 * of its own goes to an address without an account, never to one that
 * wants no email.
 * @param db - The database.
 * @param emails - The addresses, any case.
 * @returns The choice of each address that has an account, lower case.
 */
export const emailChoicesOf = async (
  db: Db,
  emails: readonly (string | null)[],
): Promise<Map<string, EmailNews>> => {
  const wanted = [
    ...new Set(emails.flatMap((email) => (email ? [email.toLowerCase()] : []))),
  ];
  if (wanted.length === 0) return new Map();
  const rows = await db
    .select({ email: accounts.email, mode: accounts.emailNews })
    .from(accounts)
    .where(inArray(accounts.email, wanted));
  return new Map(rows.map((row) => [row.email, row.mode]));
};

/**
 * The accounts of the active members of events.
 * @param db - The database.
 * @param partyIds - The events.
 * @returns Their account ids.
 */
export const memberAccounts = async (
  db: Db,
  partyIds: readonly string[],
): Promise<string[]> => {
  const people = await db
    .select({ email: persons.email })
    .from(persons)
    .where(
      and(inArray(persons.partyId, anyOf(partyIds)), eq(persons.active, true)),
    );
  return [
    ...(
      await accountsOfEmails(
        db,
        people.map((person) => person.email),
      )
    ).values(),
  ];
};

/**
 * The accounts that organise an event.
 * @param db - The database.
 * @param partyId - The event.
 * @returns Their ids.
 */
export const organiserAccounts = async (
  db: Db,
  partyId: string,
): Promise<string[]> =>
  (
    await db
      .select({ accountId: partyOrganisers.accountId })
      .from(partyOrganisers)
      .where(eq(partyOrganisers.partyId, partyId))
  ).map((row) => row.accountId);

/** Ignores a failure: a news never stops the gesture that made it. */
export const quietly = async (write: () => Promise<void>): Promise<void> => {
  await write().catch(() => undefined);
};
