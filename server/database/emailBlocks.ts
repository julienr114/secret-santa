import { and, count, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  emailBlocks,
  emailReports,
  emailSeen,
  parties,
} from './schema';
import { newId } from '#server/http/context';
import type { BlockCause, SentBy } from '#server/utils/stopEmail';

// The addresses that receive nothing, the addresses already written to,
// and the reports of a send (ticket 130). By print only: an address in
// clear is never kept here.

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/**
 * Which of some prints are blocked, and why.
 * @param db - The database.
 * @param prints - The prints of the addresses.
 * @returns The cause of each blocked print.
 */
export const blockedOf = async (
  db: Db,
  prints: readonly string[],
): Promise<Map<string, BlockCause>> =>
  new Map(
    (
      await db
        .select({ print: emailBlocks.emailPrint, cause: emailBlocks.cause })
        .from(emailBlocks)
        .where(inArray(emailBlocks.emailPrint, anyOf(prints)))
    ).map((row) => [row.print, row.cause]),
  );

/**
 * Blocks an address: the person's own refusal replaces any other cause.
 * @param db - The database.
 * @param print - Its print.
 * @param cause - Why.
 * @param now - Now (ISO).
 * @returns Once blocked.
 */
export const blockAddress = async (
  db: Db,
  print: string,
  cause: BlockCause,
  now: string,
): Promise<void> => {
  await db
    .insert(emailBlocks)
    .values({ emailPrint: print, cause, createdAt: now })
    .onConflictDoUpdate({
      target: emailBlocks.emailPrint,
      set: cause === 'person' ? { cause } : {},
    });
};

/**
 * Lifts the block of an address: only its owner may (by the link, or
 * « Me prévenir »).
 * @param db - The database.
 * @param print - Its print.
 * @returns Once lifted.
 */
export const unblockAddress = async (db: Db, print: string): Promise<void> => {
  await db.delete(emailBlocks).where(eq(emailBlocks.emailPrint, print));
};

/**
 * Which of some prints were already written to.
 * @param db - The database.
 * @param prints - The prints.
 * @returns Those already written to.
 */
export const seenOf = async (
  db: Db,
  prints: readonly string[],
): Promise<Set<string>> =>
  new Set(
    (
      await db
        .select({ print: emailSeen.emailPrint })
        .from(emailSeen)
        .where(inArray(emailSeen.emailPrint, anyOf(prints)))
    ).map((row) => row.print),
  );

/**
 * Marks addresses as written to.
 * @param db - The database.
 * @param prints - Their prints.
 * @param now - Now (ISO).
 * @returns Once marked.
 */
export const markWritten = async (
  db: Db,
  prints: readonly string[],
  now: string,
): Promise<void> => {
  if (prints.length === 0) return;
  await db
    .insert(emailSeen)
    .values(
      [...new Set(prints)].map((print) => ({
        emailPrint: print,
        firstAt: now,
      })),
    )
    .onConflictDoNothing();
};

/**
 * The events whose emails the super-admin cut, among some.
 * @param db - The database.
 * @param partyIds - The events.
 * @returns Those cut.
 */
export const emailsOffOf = async (
  db: Db,
  partyIds: readonly string[],
): Promise<Set<string>> =>
  new Set(
    (
      await db
        .select({ id: parties.id })
        .from(parties)
        .where(
          and(
            inArray(parties.id, anyOf(partyIds)),
            eq(parties.emailsOff, true),
          ),
        )
    ).map((row) => row.id),
  );

/**
 * Records « Signaler cet envoi ».
 * @param db - The database.
 * @param by - The event, and the account that sent.
 * @param now - Now (ISO).
 * @returns Once recorded.
 */
export const reportSend = async (
  db: Db,
  by: SentBy,
  now: string,
): Promise<void> => {
  await db.insert(emailReports).values({
    id: newId(),
    partyId: by.partyId,
    accountId: by.accountId,
    createdAt: now,
  });
};

/** The reports of an event, as the super-admin sees them. */
export type ReportedParty = {
  partyId: string;
  slug: string;
  name: string;
  emailsOff: boolean;
  reports: number;
  last: string;
  /** The accounts that sent, with how many reports each. */
  senders: {
    accountId: string | null;
    email: string | null;
    reports: number;
  }[];
};

/**
 * The reports of sends, by event, the latest first.
 * @param db - The database.
 * @returns The events reported.
 */
export const reportedParties = async (db: Db): Promise<ReportedParty[]> => {
  const rows = await db
    .select({
      partyId: emailReports.partyId,
      accountId: emailReports.accountId,
      createdAt: emailReports.createdAt,
      slug: parties.slug,
      name: parties.name,
      emailsOff: parties.emailsOff,
      email: accounts.email,
    })
    .from(emailReports)
    .innerJoin(parties, eq(parties.id, emailReports.partyId))
    .leftJoin(accounts, eq(accounts.id, emailReports.accountId))
    .orderBy(desc(emailReports.createdAt));
  return [...new Set(rows.map((row) => row.partyId))].map((partyId) => {
    const mine = rows.filter((row) => row.partyId === partyId);
    const first = mine[0]!;
    return {
      partyId,
      slug: first.slug,
      name: first.name,
      emailsOff: first.emailsOff,
      reports: mine.length,
      last: first.createdAt,
      senders: [...new Set(mine.map((row) => row.accountId))].map(
        (accountId) => ({
          accountId,
          email: mine.find((row) => row.accountId === accountId)?.email ?? null,
          reports: mine.filter((row) => row.accountId === accountId).length,
        }),
      ),
    };
  });
};

/**
 * How many addresses refused the emails themselves, for the dashboard.
 * @param db - The database.
 * @returns The count.
 */
export const refusedCount = async (db: Db): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(emailBlocks)
    .where(eq(emailBlocks.cause, 'person'));
  return row?.n ?? 0;
};
