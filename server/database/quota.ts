import { and, asc, count, eq, ne } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  partyOrganisers,
  partyYears,
  secretSantas,
  parties,
  persons,
  type AccountRow,
} from './schema';
import { isGroup } from './groups';
import { groupsByAccount, type AccountGroup } from '#server/utils/overview';
import type { QuotaAccount } from '#server/utils/quota';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import { MAX_PARTY_MEMBERS } from '#server/utils/parties';

// The limit of Secret Santa per account (docs/spec/v3/modele.md).

/** The Secret Santa in progress: every one not closed yet. */
const inProgress = ne(secretSantas.status, 'closed');

/** How many Secret Santa in progress each account organises, by id. */
const organisedCounts = async (db: Db): Promise<Record<string, number>> =>
  Object.fromEntries(
    (
      await db
        .select({ accountId: partyOrganisers.accountId, n: count() })
        .from(secretSantas)
        .innerJoin(
          partyOrganisers,
          eq(partyOrganisers.partyId, secretSantas.partyId),
        )
        .where(inProgress)
        .groupBy(partyOrganisers.accountId)
    ).map((row) => [row.accountId, row.n]),
  );

/**
 * The Secret Santa in progress an account organises, oldest first: what
 * the limit counts, and what its screen lists.
 * @param db - The database.
 * @param accountId - The account.
 * @returns Each with its party, its year and its state.
 */
export const listOrganisedSecretSantas = (db: Db, accountId: string) =>
  db
    .select({
      id: secretSantas.id,
      label: secretSantas.label,
      status: secretSantas.status,
      year: partyYears.year,
      partyName: parties.name,
      partySlug: parties.slug,
    })
    .from(secretSantas)
    .innerJoin(
      partyOrganisers,
      eq(partyOrganisers.partyId, secretSantas.partyId),
    )
    .innerJoin(parties, eq(parties.id, secretSantas.partyId))
    .innerJoin(partyYears, eq(partyYears.id, secretSantas.yearId))
    .where(and(eq(partyOrganisers.accountId, accountId), inProgress))
    .orderBy(asc(secretSantas.createdAt));

/** What the limit rules need to know about an account. */
export const quotaAccountOf = async (
  db: Db,
  account: Pick<AccountRow, 'id' | 'isSuperAdmin' | 'secretSantaLimit'>,
): Promise<QuotaAccount> => {
  const [row] = await db
    .select({ n: count() })
    .from(secretSantas)
    .innerJoin(
      partyOrganisers,
      eq(partyOrganisers.partyId, secretSantas.partyId),
    )
    .where(and(eq(partyOrganisers.accountId, account.id), inProgress));
  return {
    isSuperAdmin: account.isSuperAdmin,
    secretSantaLimit: account.secretSantaLimit,
    organisedCount: row?.n ?? 0,
  };
};

/** The groups of each account, by account id. */
const accountGroups = async (
  db: Db,
): Promise<Record<string, AccountGroup[]>> => {
  const columns = { id: parties.id, slug: parties.slug, name: parties.name };
  const [organized, joined] = await Promise.all([
    db
      .select({ accountId: partyOrganisers.accountId, ...columns })
      .from(partyOrganisers)
      .innerJoin(parties, eq(parties.id, partyOrganisers.partyId))
      .where(isGroup)
      .orderBy(asc(parties.name)),
    db
      .select({ accountId: accounts.id, ...columns })
      .from(persons)
      .innerJoin(accounts, eq(accounts.email, persons.email))
      .innerJoin(parties, eq(parties.id, persons.partyId))
      .where(and(eq(persons.active, true), isGroup))
      .orderBy(asc(parties.name)),
  ]);
  return groupsByAccount(organized, joined);
};

export type AdminAccount = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: Avatar;
  isSuperAdmin: boolean;
  secretSantaLimit: number;
  organisedCount: number;
  /** The groups it organises, then those it takes part in. */
  groups: AccountGroup[];
  createdAt: string;
  lastLoginAt: string | null;
  disabled: boolean;
};

/** Every account with its counts, by address. */
export const listAdminAccounts = async (db: Db): Promise<AdminAccount[]> => {
  const [rows, organised, groupsOf] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.email)),
    organisedCounts(db),
    accountGroups(db),
  ]);
  return rows.map((account) => ({
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    avatar: avatarOf(account),
    isSuperAdmin: account.isSuperAdmin,
    secretSantaLimit: account.secretSantaLimit,
    organisedCount: organised[account.id] ?? 0,
    groups: groupsOf[account.id] ?? [],
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
    disabled: Boolean(account.disabledAt),
  }));
};

/**
 * What the dashboard counts: the parties, the Secret Santa in progress,
 * and the parties at 30 active members.
 */
export const appStats = async (db: Db) => {
  const [all] = await db.select({ n: count() }).from(parties).where(isGroup);
  const [active] = await db
    .select({ n: count() })
    .from(secretSantas)
    .where(inProgress);
  const members = await db
    .select({ n: count() })
    .from(persons)
    .where(eq(persons.active, true))
    .groupBy(persons.partyId);
  return {
    groups: all?.n ?? 0,
    active: active?.n ?? 0,
    fullParties: members.filter((row) => row.n >= MAX_PARTY_MEMBERS).length,
  };
};
