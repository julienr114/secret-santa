import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  isNull,
  ne,
} from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  groupMembers,
  groupRequests,
  editions,
  groups,
  persons,
  type AccountRow,
} from './schema';
import { groupsByAccount, type AccountGroup } from '#server/utils/overview';
import type { QuotaAccount } from '#server/utils/quota';
import { avatarOf, type Avatar } from '#server/utils/avatars';

// Group quotas and requests to create a group (README 22.2).

/** How many existing groups each account created, by account id. */
const createdCounts = async (db: Db): Promise<Record<string, number>> =>
  Object.fromEntries(
    (
      await db
        .select({ accountId: groups.createdBy, n: count() })
        .from(groups)
        .groupBy(groups.createdBy)
    ).flatMap((row) => (row.accountId ? [[row.accountId, row.n]] : [])),
  );

/** What the quota rules need to know about an account. */
export const quotaAccountOf = async (
  db: Db,
  account: Pick<AccountRow, 'id' | 'isSuperAdmin' | 'groupQuota'>,
): Promise<QuotaAccount> => {
  const [row] = await db
    .select({ n: count() })
    .from(groups)
    .where(eq(groups.createdBy, account.id));
  return {
    isSuperAdmin: account.isSuperAdmin,
    groupQuota: account.groupQuota,
    createdCount: row?.n ?? 0,
  };
};

/** The most recent request of an account, or null. */
export const latestRequest = async (db: Db, accountId: string) => {
  const [request] = await db
    .select()
    .from(groupRequests)
    .where(eq(groupRequests.accountId, accountId))
    .orderBy(desc(groupRequests.createdAt))
    .limit(1);
  return request ?? null;
};

/** A request with the account that made it, or null. */
export const findRequest = async (db: Db, requestId: string) => {
  const [row] = await db
    .select({ request: groupRequests, account: accounts })
    .from(groupRequests)
    .innerJoin(accounts, eq(accounts.id, groupRequests.accountId))
    .where(eq(groupRequests.id, requestId))
    .limit(1);
  return row ?? null;
};

/** The requests awaiting a decision, oldest first, with their address. */
export const listPendingRequests = (db: Db) =>
  db
    .select({
      id: groupRequests.id,
      accountId: groupRequests.accountId,
      email: accounts.email,
      message: groupRequests.message,
      createdAt: groupRequests.createdAt,
    })
    .from(groupRequests)
    .innerJoin(accounts, eq(accounts.id, groupRequests.accountId))
    .where(eq(groupRequests.status, 'pending'))
    .orderBy(asc(groupRequests.createdAt));

/** How many requests await a decision. */
export const pendingRequestCount = async (db: Db): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(groupRequests)
    .where(eq(groupRequests.status, 'pending'));
  return row?.n ?? 0;
};

/** The request waiting the longest, with its account, or null. */
export const oldestPendingRequest = async (db: Db) => {
  const [row] = await db
    .select({ request: groupRequests, account: accounts })
    .from(groupRequests)
    .innerJoin(accounts, eq(accounts.id, groupRequests.accountId))
    .where(eq(groupRequests.status, 'pending'))
    .orderBy(asc(groupRequests.createdAt))
    .limit(1);
  return row ?? null;
};

/** The super-admins who can act: where a new request is announced. */
export const listSuperAdmins = (db: Db) =>
  db
    .select({ email: accounts.email, language: accounts.language })
    .from(accounts)
    .where(and(eq(accounts.isSuperAdmin, true), isNull(accounts.disabledAt)));

/** The groups of each account, by account id. */
const accountGroups = async (
  db: Db,
): Promise<Record<string, AccountGroup[]>> => {
  const columns = { id: groups.id, slug: groups.slug, name: groups.name };
  const [organized, joined] = await Promise.all([
    db
      .select({ accountId: groupMembers.accountId, ...columns })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .orderBy(asc(groups.name)),
    db
      .select({ accountId: accounts.id, ...columns })
      .from(persons)
      .innerJoin(accounts, eq(accounts.email, persons.email))
      .innerJoin(groups, eq(groups.id, persons.groupId))
      .where(eq(persons.active, true))
      .orderBy(asc(groups.name)),
  ]);
  return groupsByAccount(organized, joined);
};

/** Accounts whose latest request was refused. */
const refusedAccounts = async (db: Db): Promise<Set<string>> => {
  const rows = await db
    .select({
      accountId: groupRequests.accountId,
      status: groupRequests.status,
    })
    .from(groupRequests)
    .orderBy(asc(groupRequests.createdAt));
  const latest = Object.fromEntries(
    rows.map((row) => [row.accountId, row.status]),
  );
  return new Set(Object.keys(latest).filter((id) => latest[id] === 'refused'));
};

export type AdminAccount = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: Avatar;
  isSuperAdmin: boolean;
  groupQuota: number;
  createdCount: number;
  /** The groups it organises, then those it takes part in. */
  groups: AccountGroup[];
  /** Its latest request for a group was refused. */
  requestRefused: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  disabled: boolean;
};

/** Every account with its counts, by address. */
export const listAdminAccounts = async (db: Db): Promise<AdminAccount[]> => {
  const [rows, created, groupsOf, refused] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.email)),
    createdCounts(db),
    accountGroups(db),
    refusedAccounts(db),
  ]);
  return rows.map((account) => ({
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    avatar: avatarOf(account),
    isSuperAdmin: account.isSuperAdmin,
    groupQuota: account.groupQuota,
    createdCount: created[account.id] ?? 0,
    groups: groupsOf[account.id] ?? [],
    requestRefused: refused.has(account.id),
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
    disabled: Boolean(account.disabledAt),
  }));
};

/** How many groups the app holds, and how many have a draw in progress. */
export const appStats = async (db: Db) => {
  const [all] = await db.select({ n: count() }).from(groups);
  const [active] = await db
    .select({ n: countDistinct(editions.groupId) })
    .from(editions)
    .where(ne(editions.status, 'closed'));
  return { groups: all?.n ?? 0, active: active?.n ?? 0 };
};

/**
 * Approves the pending request of an account, if any: raising its quota
 * by hand answers it. Only a pending request changes.
 * @returns Whether a request was approved.
 */
export const approvePendingRequest = async (
  db: Db,
  {
    accountId,
    decidedBy,
    now,
  }: { accountId: string; decidedBy: string; now: string },
): Promise<boolean> =>
  (
    await db
      .update(groupRequests)
      .set({ status: 'approved', decidedAt: now, decidedBy })
      .where(
        and(
          eq(groupRequests.accountId, accountId),
          eq(groupRequests.status, 'pending'),
        ),
      )
      .returning({ id: groupRequests.id })
  ).length > 0;
