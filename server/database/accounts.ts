import { adoptedAvatar } from '#server/utils/avatars';
import { and, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import type { Db } from './client';
import { accounts, loginLinks, persons, sessions } from './schema';
import type { Locale } from '#shared/i18n';
import { sessionsToClose } from '#server/utils/limits';
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
    firstName = null,
    avatar = null,
    now,
  }: {
    email: string;
    isSuperAdmin: boolean;
    language?: Locale;
    firstName?: string | null;
    /** The face it had in a Secret Santa, if it had one. */
    avatar?: { emoji: string; color: string } | null;
    now: string;
  },
) => {
  const account: typeof accounts.$inferSelect = {
    id: newId(),
    email,
    firstName,
    lastName: null,
    avatarEmoji: avatar?.emoji ?? null,
    avatarColor: avatar?.color ?? null,
    isSuperAdmin,
    secretSantaLimit: 3,
    language,
    createdAt: now,
    lastLoginAt: null,
    disabledAt: null,
    listTourSeen: false,
    firstLineNoteSeen: false,
  };
  await db.insert(accounts).values(account);
  return account;
};

/** A person some organiser registered with this address, if any. */
export const findPersonByEmail = async (db: Db, email: string) => {
  const [person] = await db
    .select({
      id: persons.id,
      language: persons.language,
      avatarEmoji: persons.avatarEmoji,
      avatarColor: persons.avatarColor,
    })
    .from(persons)
    .where(eq(persons.email, email))
    .limit(1);
  return person ?? null;
};

/**
 * Gives an account the face of the person it becomes in a Secret Santa,
 * when it has none of its own (`adoptedAvatar`).
 * @param db - The database.
 * @param account - The account.
 * @param account.id - Its id.
 * @param account.avatarEmoji - Its own emoji, or null.
 * @param person - The person, as the Secret Santa shows them.
 * @param person.id - Their id.
 * @param person.avatarEmoji - Their emoji, or null.
 * @param person.avatarColor - Their colour, or null.
 * @returns Once done.
 */
export const adoptPersonAvatar = async (
  db: Db,
  account: { id: string; avatarEmoji: string | null },
  person: {
    id: string;
    avatarEmoji?: string | null;
    avatarColor?: string | null;
  },
) => {
  const avatar = adoptedAvatar(account, person);
  if (!avatar) return;
  await db
    .update(accounts)
    .set({ avatarEmoji: avatar.emoji, avatarColor: avatar.color })
    .where(eq(accounts.id, account.id));
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

/**
 * Links asked: within the hour for the account and from the client
 * address, within the day by everyone.
 */
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
  const [day] = await db
    .select({ n: sql<number>`count(*)` })
    .from(loginLinks)
    .where(gt(loginLinks.createdAt, isoAfter(now, -24 * 60 * 60 * 1000)));
  return {
    forEmail: accountId ? await count(eq(loginLinks.accountId, accountId)) : 0,
    fromIp: await count(eq(loginLinks.ipHash, ipHash)),
    today: day?.n ?? 0,
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
  return openSessionFor(db, { accountId, userAgent, now });
};

/**
 * Opens a session for an account whose address was just proved, by a
 * login link or by the link of an invitation (lot 25 bis).
 * @returns The session id.
 */
export const openSessionFor = async (
  db: Db,
  {
    accountId,
    userAgent,
    now,
  }: { accountId: string; userAgent: string | null; now: string },
): Promise<string> => {
  // An account keeps so many sessions open (lot 38 A): beyond, the ones
  // seen longest ago close.
  const open = await listActiveSessions(db, accountId, now);
  const closing = sessionsToClose(open);
  if (closing.length > 0) {
    await db
      .update(sessions)
      .set({ revokedAt: now })
      .where(inArray(sessions.id, closing));
  }
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
