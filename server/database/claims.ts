import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  giftClaims,
  giftListVisits,
  giftLists,
  giftOffList,
  type AccountRow,
} from './schema';
import { newId, nowIso } from '#server/http/context';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import type { ClaimChange } from '#server/utils/claims';
import type { ClaimMode } from '#server/utils/lists';

// Who gives what on the gift lists (README 22.19, lot 22).

/**
 * How an account is named on a list: its first name, or the start of its
 * address without one.
 * @param account - The account.
 * @returns The name and the icon.
 */
export const giverOf = (
  account: Pick<
    AccountRow,
    'id' | 'email' | 'firstName' | 'avatarEmoji' | 'avatarColor'
  >,
): { name: string; avatar: Avatar } => ({
  name: account.firstName ?? account.email.split('@')[0] ?? account.email,
  avatar: avatarOf(account),
});

/** A claim with who made it. */
export type ClaimWithGiver = {
  ideaId: string;
  accountId: string;
  mode: ClaimMode;
  anonymous: boolean;
  note: string | null;
  closed: boolean;
  createdAt: string;
  name: string;
  avatar: Avatar;
};

/** The claims of some lists, each with who made it. */
export const claimsOfLists = async (
  db: Db,
  listIds: readonly string[],
): Promise<ClaimWithGiver[]> => {
  if (listIds.length === 0) return [];
  const rows = await db
    .select({ claim: giftClaims, account: accounts })
    .from(giftClaims)
    .innerJoin(accounts, eq(accounts.id, giftClaims.accountId))
    .where(inArray(giftClaims.listId, [...listIds]));
  return rows.map(({ claim, account }) => ({
    ideaId: claim.ideaId,
    accountId: claim.accountId,
    mode: claim.mode,
    anonymous: claim.anonymous,
    note: claim.note,
    closed: claim.closed,
    createdAt: claim.createdAt,
    ...giverOf(account),
  }));
};

/** The gifts not on some lists, each with who gives it. */
export const offListOfLists = async (db: Db, listIds: readonly string[]) => {
  if (listIds.length === 0) return [];
  const rows = await db
    .select({ gift: giftOffList, account: accounts })
    .from(giftOffList)
    .innerJoin(accounts, eq(accounts.id, giftOffList.accountId))
    .where(inArray(giftOffList.listId, [...listIds]));
  return rows.map(({ gift, account }) => ({
    id: gift.id,
    listId: gift.listId,
    listPersonId: gift.listPersonId,
    accountId: gift.accountId,
    text: gift.text,
    anonymous: gift.anonymous,
    createdAt: gift.createdAt,
    ...giverOf(account),
  }));
};

/**
 * Ticks a free idea, alone: written only if nobody gives it yet, in one
 * statement, so that two accounts never give the same idea alone.
 * @param db - The database.
 * @param claim - Who gives what.
 * @returns Whether it was written.
 */
export const claimIfFree = async (
  db: Db,
  claim: {
    listId: string;
    ideaId: string;
    accountId: string;
    mode: ClaimMode;
    anonymous: boolean;
    note: string | null;
  },
): Promise<boolean> => {
  const result = await db.run(sql`
    INSERT INTO gift_claims
      (id, list_id, idea_id, account_id, mode, anonymous, note, closed, created_at)
    SELECT ${newId()}, ${claim.listId}, ${claim.ideaId}, ${claim.accountId},
      ${claim.mode}, ${claim.anonymous ? 1 : 0}, ${claim.note}, 0, ${nowIso()}
    WHERE NOT EXISTS (SELECT 1 FROM gift_claims WHERE idea_id = ${claim.ideaId})
  `);
  return (result.meta?.changes ?? 0) > 0;
};

/** Joins a gift given by several. */
export const joinClaim = (
  db: Db,
  claim: {
    listId: string;
    ideaId: string;
    accountId: string;
    note: string | null;
  },
) =>
  db.insert(giftClaims).values({
    id: newId(),
    listId: claim.listId,
    ideaId: claim.ideaId,
    accountId: claim.accountId,
    mode: 'group',
    anonymous: false,
    note: claim.note,
    createdAt: nowIso(),
  });

/** Changes one's own way of giving an idea. */
export const changeClaim = (
  db: Db,
  ideaId: string,
  accountId: string,
  change: ClaimChange,
) =>
  db
    .update(giftClaims)
    .set({
      ...(change.mode ? { mode: change.mode } : {}),
      ...(change.mode === 'group' ? { anonymous: false } : {}),
      ...(change.anonymous === undefined
        ? {}
        : { anonymous: change.anonymous }),
      ...(change.note === undefined ? {} : { note: change.note || null }),
      ...(change.closed === undefined ? {} : { closed: change.closed }),
    })
    .where(
      and(eq(giftClaims.ideaId, ideaId), eq(giftClaims.accountId, accountId)),
    );

/** « Finalement, je ne l'offre plus »: the next one leads, if any. */
export const leaveClaim = (db: Db, ideaId: string, accountId: string) =>
  db
    .delete(giftClaims)
    .where(
      and(eq(giftClaims.ideaId, ideaId), eq(giftClaims.accountId, accountId)),
    );

/** Says a gift not on the list. */
export const addOffList = (
  db: Db,
  gift: {
    listId: string;
    listPersonId: string;
    accountId: string;
    text: string;
    anonymous: boolean;
  },
) =>
  db.insert(giftOffList).values({ id: newId(), ...gift, createdAt: nowIso() });

/** Takes back one's own gift not on the list. */
export const removeOffList = (db: Db, id: string, accountId: string) =>
  db
    .delete(giftOffList)
    .where(and(eq(giftOffList.id, id), eq(giftOffList.accountId, accountId)));

/**
 * Notes a visit of a list while logged in, and tells when the last one
 * was.
 * @param db - The database.
 * @param listId - The list.
 * @param accountId - Who visits.
 * @returns The time of the visit before, or null for a first one.
 */
export const recordVisit = async (
  db: Db,
  listId: string,
  accountId: string,
): Promise<string | null> => {
  const before = await db
    .select({ lastSeenAt: giftListVisits.lastSeenAt })
    .from(giftListVisits)
    .where(
      and(
        eq(giftListVisits.listId, listId),
        eq(giftListVisits.accountId, accountId),
      ),
    )
    .get();
  await db
    .insert(giftListVisits)
    .values({ listId, accountId, lastSeenAt: nowIso() })
    .onConflictDoUpdate({
      target: [giftListVisits.listId, giftListVisits.accountId],
      set: { lastSeenAt: nowIso() },
    });
  return before?.lastSeenAt ?? null;
};

/** The shared lists an account opened, not its own, with its last visit. */
export const visitedLists = (db: Db, accountId: string) =>
  db
    .select({ list: giftLists, lastSeenAt: giftListVisits.lastSeenAt })
    .from(giftListVisits)
    .innerJoin(giftLists, eq(giftLists.id, giftListVisits.listId))
    .where(eq(giftListVisits.accountId, accountId))
    .orderBy(desc(giftListVisits.lastSeenAt));

/** Deletes what hangs from ideas: who gives them. */
export const deleteClaimsOfIdeas = (db: Db, ideaIds: readonly string[]) =>
  db.delete(giftClaims).where(inArray(giftClaims.ideaId, [...ideaIds]));
