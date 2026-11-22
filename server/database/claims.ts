import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  giftClaims,
  giftGiverClaims,
  giftListGivers,
  giftListVisits,
  giftLists,
  giftOffList,
  type AccountRow,
} from './schema';
import { newId, nowIso } from '#server/http/context';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import {
  accountKey,
  ticksToLink,
  writtenKey,
  type ClaimChange,
  type GiverKey,
} from '#server/utils/claims';
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
  /** The row itself: names a tick without saying whose it is. */
  id: string;
  ideaId: string;
  /**
   * Whose it is: an account, or, for a first name written by those who
   * hold the list, its key (`g:…`), which no account has.
   */
  accountId: string;
  /** Who gives it, as the sheet « Qui l'offre ? » names them. */
  key: GiverKey;
  mode: ClaimMode;
  anonymous: boolean;
  note: string | null;
  closed: boolean;
  createdAt: string;
  name: string;
  /** Null for a first name written: no icon of its own. */
  avatar: Avatar | null;
  /** The account that noted it for someone; null when ticked by its giver. */
  notedBy: string | null;
  notedByName: string | null;
  /** The list it is on. */
  listId: string;
};

/** The claims of some lists, each with who made it: accounts and names. */
export const claimsOfLists = async (
  db: Db,
  listIds: readonly string[],
): Promise<ClaimWithGiver[]> => {
  if (listIds.length === 0) return [];
  const ids = [...listIds];
  const [rows, named] = await Promise.all([
    db
      .select({ claim: giftClaims, account: accounts })
      .from(giftClaims)
      .innerJoin(accounts, eq(accounts.id, giftClaims.accountId))
      .where(inArray(giftClaims.listId, ids)),
    db
      .select({ claim: giftGiverClaims, giver: giftListGivers })
      .from(giftGiverClaims)
      .innerJoin(giftListGivers, eq(giftListGivers.id, giftGiverClaims.giverId))
      .where(inArray(giftGiverClaims.listId, ids)),
  ]);
  const noters = [
    ...new Set(
      [
        ...rows.map(({ claim }) => claim.notedBy),
        ...named.map(({ claim }) => claim.notedBy),
      ].filter((id): id is string => id !== null),
    ),
  ];
  const noterNames = new Map(
    (noters.length === 0
      ? []
      : await db.select().from(accounts).where(inArray(accounts.id, noters))
    ).map((account) => [account.id, giverOf(account).name]),
  );
  const noted = (id: string | null) => ({
    notedBy: id,
    notedByName: id ? (noterNames.get(id) ?? null) : null,
  });
  return [
    ...rows.map(({ claim, account }) => {
      const giver = giverOf(account);
      return {
        id: claim.id,
        listId: claim.listId,
        ideaId: claim.ideaId,
        accountId: claim.accountId,
        key: accountKey(claim.accountId),
        mode: claim.mode,
        anonymous: claim.anonymous,
        note: claim.note,
        closed: claim.closed,
        createdAt: claim.createdAt,
        // Written for an address that became theirs: the name written.
        name: claim.giverName ?? giver.name,
        avatar: giver.avatar,
        ...noted(claim.notedBy),
      };
    }),
    ...named.map(({ claim, giver }) => ({
      id: claim.id,
      listId: claim.listId,
      ideaId: claim.ideaId,
      accountId: writtenKey(giver.id),
      key: writtenKey(giver.id),
      mode: claim.mode,
      anonymous: false,
      note: claim.note,
      closed: claim.closed,
      createdAt: claim.createdAt,
      name: giver.name,
      avatar: null,
      ...noted(claim.notedBy),
    })),
  ];
};

/** The first names written on a list (« Cocher pour quelqu'un »). */
export const writtenGiversOf = (db: Db, listId: string) =>
  db
    .select({
      id: giftListGivers.id,
      name: giftListGivers.name,
      email: giftListGivers.email,
    })
    .from(giftListGivers)
    .where(eq(giftListGivers.listId, listId))
    .orderBy(asc(giftListGivers.createdAt));

/**
 * Writes a first name on a list, with an address or without.
 * @param db - The database.
 * @param giver - The name, its address, the list and who writes it.
 * @param giver.listId - The list.
 * @param giver.name - The first name.
 * @param giver.email - Its address, or null.
 * @param giver.addedBy - Who holds the list and writes it.
 * @returns Its id.
 */
export const addWrittenGiver = async (
  db: Db,
  giver: {
    listId: string;
    name: string;
    email: string | null;
    addedBy: string;
  },
): Promise<string> => {
  const id = newId();
  await db.insert(giftListGivers).values({ id, ...giver, createdAt: nowIso() });
  return id;
};

/**
 * Saves who gives an idea, as the sheet « Qui l'offre ? » decided
 * (`giversPlan`): the ticks that go, those that stay with the new way of
 * giving, those that come, each noted by the one who holds the list (not
 * when it is their own), and « On est au complet » on the one who leads.
 * One batch: all of it, or nothing.
 * @param db - The database.
 * @param input - What to write.
 * @param input.listId - The list.
 * @param input.ideaId - The idea.
 * @param input.by - The account that holds the list and saves.
 * @param input.mode - One person or several.
 * @param input.closed - « On est au complet », for several.
 * @param input.remove - The rows that go.
 * @param input.keep - The rows that stay.
 * @param input.add - Who comes in.
 * @param input.leader - Who leads after.
 * @returns Once written.
 */
export const saveGivers = async (
  db: Db,
  input: {
    listId: string;
    ideaId: string;
    by: string;
    mode: ClaimMode;
    closed: boolean;
    remove: readonly string[];
    keep: readonly { id: string; key: GiverKey }[];
    add: readonly GiverKey[];
    leader: GiverKey;
  },
) => {
  const closedOf = (key: GiverKey) =>
    input.mode === 'group' && input.closed && key === input.leader;
  const start = Date.now();
  const writes = [
    db.delete(giftClaims).where(inArray(giftClaims.id, [...input.remove])),
    db
      .delete(giftGiverClaims)
      .where(inArray(giftGiverClaims.id, [...input.remove])),
    ...input.keep.map((claim) =>
      claim.key.startsWith('a:')
        ? db
            .update(giftClaims)
            .set({ mode: input.mode, closed: closedOf(claim.key) })
            .where(eq(giftClaims.id, claim.id))
        : db
            .update(giftGiverClaims)
            .set({ mode: input.mode, closed: closedOf(claim.key) })
            .where(eq(giftGiverClaims.id, claim.id)),
    ),
    // Those who come in come after, in the order chosen.
    ...input.add.map((key, index) => {
      const createdAt = new Date(start + index).toISOString();
      const id = key.slice(2);
      return key.startsWith('a:')
        ? db.insert(giftClaims).values({
            id: newId(),
            listId: input.listId,
            ideaId: input.ideaId,
            accountId: id,
            mode: input.mode,
            anonymous: false,
            closed: closedOf(key),
            notedBy: id === input.by ? null : input.by,
            createdAt,
          })
        : db.insert(giftGiverClaims).values({
            id: newId(),
            listId: input.listId,
            ideaId: input.ideaId,
            giverId: id,
            mode: input.mode,
            closed: closedOf(key),
            notedBy: input.by,
            createdAt,
          });
    }),
  ];
  const [first, ...rest] = writes;
  await db.batch([first!, ...rest]);
};

/**
 * Gives an account the ticks kept for its address (21 November 2026), at
 * its coming: those first names become it, with their place, their way
 * and who noted them; the name written stays what those who hold the
 * list read. An idea the account already gives keeps its own tick.
 * @param db - The database.
 * @param account - The account that comes.
 * @param account.id - Its id.
 * @param account.email - Its address.
 * @returns Once done.
 */
export const linkWrittenGiversOf = async (
  db: Db,
  account: { id: string; email: string },
) => {
  const givers = await db
    .select()
    .from(giftListGivers)
    .where(eq(giftListGivers.email, account.email));
  if (givers.length === 0) return;
  const giverIds = givers.map((giver) => giver.id);
  const waiting = await db
    .select()
    .from(giftGiverClaims)
    .where(inArray(giftGiverClaims.giverId, giverIds));
  const given = new Set(
    waiting.length === 0
      ? []
      : (
          await db
            .select({ ideaId: giftClaims.ideaId })
            .from(giftClaims)
            .where(
              and(
                eq(giftClaims.accountId, account.id),
                inArray(
                  giftClaims.ideaId,
                  waiting.map((claim) => claim.ideaId),
                ),
              ),
            )
        ).map((claim) => claim.ideaId),
  );
  const { take } = ticksToLink(waiting, given);
  const nameOf = new Map(givers.map((giver) => [giver.id, giver.name]));
  await db.batch([
    db
      .delete(giftGiverClaims)
      .where(inArray(giftGiverClaims.giverId, giverIds)),
    ...take.map((claim) =>
      db.insert(giftClaims).values({
        id: newId(),
        listId: claim.listId,
        ideaId: claim.ideaId,
        accountId: account.id,
        mode: claim.mode,
        anonymous: false,
        note: claim.note,
        closed: claim.closed,
        createdAt: claim.createdAt,
        notedBy: claim.notedBy,
        giverName: nameOf.get(claim.giverId) ?? null,
      }),
    ),
    db.delete(giftListGivers).where(inArray(giftListGivers.id, giverIds)),
  ]);
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
      AND NOT EXISTS (
        SELECT 1 FROM gift_giver_claims WHERE idea_id = ${claim.ideaId}
      )
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

/**
 * Takes one tick off, named by its row, on an idea of a list: an
 * account's, or a first name's written by those who hold it.
 */
export const removeClaim = (
  db: Db,
  where: { listId: string; ideaId: string; claimId: string },
) =>
  db.batch([
    db
      .delete(giftClaims)
      .where(
        and(
          eq(giftClaims.id, where.claimId),
          eq(giftClaims.ideaId, where.ideaId),
          eq(giftClaims.listId, where.listId),
        ),
      ),
    db
      .delete(giftGiverClaims)
      .where(
        and(
          eq(giftGiverClaims.id, where.claimId),
          eq(giftGiverClaims.ideaId, where.ideaId),
          eq(giftGiverClaims.listId, where.listId),
        ),
      ),
  ]);

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

/** Deletes what hangs from ideas: who gives them, accounts and names. */
export const deleteClaimsOfIdeas = (db: Db, ideaIds: readonly string[]) =>
  [
    db.delete(giftClaims).where(inArray(giftClaims.ideaId, [...ideaIds])),
    db
      .delete(giftGiverClaims)
      .where(inArray(giftGiverClaims.ideaId, [...ideaIds])),
  ] as const;
