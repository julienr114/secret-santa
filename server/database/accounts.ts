import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import type { Db } from './client';
import { accounts, loginLinks, persons, sessions } from './schema';
import type { Locale } from '#shared/i18n';
import { newId } from '#server/http/context';
import {
  LINK_REQUESTS_WINDOW_MS,
  LOGIN_LINK_TTL_MS,
  SESSION_TTL_MS,
  isoAfter,
} from '#server/utils/accounts';

// Accounts, login links and sessions (README 22.5).

/** The account of an address (lower case), or null. */
export const findAccountByEmail = async (db: Db, email: string) => {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1);
  return account ?? null;
};

/** Creates an account; the first login link will prove the address. */
export const createAccount = async (
  db: Db,
  {
    email,
    isSuperAdmin,
    language = 'fr',
    now,
  }: { email: string; isSuperAdmin: boolean; language?: Locale; now: string },
) => {
  const account: typeof accounts.$inferSelect = {
    id: newId(),
    email,
    firstName: null,
    lastName: null,
    avatarEmoji: null,
    avatarColor: null,
    isSuperAdmin,
    groupQuota: 0,
    language,
    createdAt: now,
    lastLoginAt: null,
    disabledAt: null,
  };
  await db.insert(accounts).values(account);
  return account;
};

/** A person some organiser registered with this address, if any. */
export const findPersonByEmail = async (db: Db, email: string) => {
  const [person] = await db
    .select({ language: persons.language })
    .from(persons)
    .where(eq(persons.email, email))
    .limit(1);
  return person ?? null;
};

/** The account behind an id, or null. */
export const findAccountById = async (db: Db, accountId: string) => {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);
  return account ?? null;
};

/** Links asked within the window, for the account and from the address. */
export const recentLinkRequests = async (
  db: Db,
  {
    accountId,
    ipHash,
    now,
  }: { accountId: string | null; ipHash: string; now: string },
) => {
  const since = isoAfter(now, -LINK_REQUESTS_WINDOW_MS);
  const count = async (where: ReturnType<typeof eq>) => {
    const [row] = await db
      .select({ n: sql<number>`count(*)` })
      .from(loginLinks)
      .where(and(where, gt(loginLinks.createdAt, since)));
    return row?.n ?? 0;
  };
  return {
    forAccount: accountId
      ? await count(eq(loginLinks.accountId, accountId))
      : 0,
    fromIp: await count(eq(loginLinks.ipHash, ipHash)),
  };
};

/**
 * Stores a new login link and, in the same transaction, invalidates the
 * unused ones of the account: only the latest link works.
 */
export const replaceLoginLink = (
  db: Db,
  {
    accountId,
    tokenHash,
    ipHash,
    now,
  }: { accountId: string; tokenHash: string; ipHash: string; now: string },
) =>
  db.batch([
    db
      .update(loginLinks)
      .set({ usedAt: now })
      .where(
        and(eq(loginLinks.accountId, accountId), isNull(loginLinks.usedAt)),
      ),
    db.insert(loginLinks).values({
      id: newId(),
      accountId,
      tokenHash,
      createdAt: now,
      expiresAt: isoAfter(now, LOGIN_LINK_TTL_MS),
      usedAt: null,
      ipHash,
    }),
  ]);

/** A login link with its account, by the hash of its token. */
export const findLoginLink = async (db: Db, tokenHash: string) => {
  const [row] = await db
    .select({ link: loginLinks, account: accounts })
    .from(loginLinks)
    .innerJoin(accounts, eq(accounts.id, loginLinks.accountId))
    .where(eq(loginLinks.tokenHash, tokenHash))
    .limit(1);
  return row ?? null;
};

/**
 * Consumes a link and opens a session, atomically: the update only
 * matches a link not used yet, so two confirmations cannot both win.
 * @returns The session id, or null when the link was used meanwhile.
 */
export const openSession = async (
  db: Db,
  {
    linkId,
    accountId,
    userAgent,
    now,
  }: {
    linkId: string;
    accountId: string;
    userAgent: string | null;
    now: string;
  },
): Promise<string | null> => {
  const consumed = await db
    .update(loginLinks)
    .set({ usedAt: now })
    .where(and(eq(loginLinks.id, linkId), isNull(loginLinks.usedAt)))
    .returning({ id: loginLinks.id });
  if (consumed.length === 0) return null;
  const id = newId();
  await db.batch([
    db.insert(sessions).values({
      id,
      accountId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: isoAfter(now, SESSION_TTL_MS),
      revokedAt: null,
      userAgent: userAgent?.slice(0, 300) ?? null,
    }),
    db
      .update(accounts)
      .set({ lastLoginAt: now })
      .where(eq(accounts.id, accountId)),
  ]);
  return id;
};

/** A session with its account, whatever its state. */
export const findSession = async (db: Db, sessionId: string) => {
  const [row] = await db
    .select({ session: sessions, account: accounts })
    .from(sessions)
    .innerJoin(accounts, eq(accounts.id, sessions.accountId))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  return row ?? null;
};

/** Records that the session was just used. */
export const touchSession = (db: Db, sessionId: string, now: string) =>
  db
    .update(sessions)
    .set({ lastSeenAt: now })
    .where(eq(sessions.id, sessionId));

/** Closes one session, if it is still open. */
export const revokeSession = (db: Db, sessionId: string, now: string) =>
  db
    .update(sessions)
    .set({ revokedAt: now })
    .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)));

/** Closes every open session of an account. */
export const revokeAllSessions = (db: Db, accountId: string, now: string) =>
  db
    .update(sessions)
    .set({ revokedAt: now })
    .where(and(eq(sessions.accountId, accountId), isNull(sessions.revokedAt)));

/** The sessions of an account that still stand, most recently seen first. */
export const listActiveSessions = async (
  db: Db,
  accountId: string,
  now: string,
) =>
  (
    await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.accountId, accountId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
        ),
      )
  ).toSorted((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
