import { SCHEDULED } from '#server/utils/limits';
import { and, asc, count, desc, eq, isNull, ne } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  secretSantas,
  partyOrganisers,
  parties,
  participations,
  persons,
} from './schema';

// What the emails to the organisers need (README 22.2).

/**
 * The organisers of a group who can be written to, with their language:
 * not those who want no email (« Aucun email », ticket 121).
 */
export const organizerRecipients = (db: Db, groupId: string) =>
  db
    .select({ email: accounts.email, language: accounts.language })
    .from(partyOrganisers)
    .innerJoin(accounts, eq(accounts.id, partyOrganisers.accountId))
    .where(
      and(
        eq(partyOrganisers.partyId, groupId),
        isNull(accounts.disabledAt),
        ne(accounts.emailNews, 'none'),
      ),
    );

/** How many take part in an edition, and how many have looked. */
export const viewCounts = async (db: Db, editionId: string) => {
  const [row] = await db
    .select({
      participants: count(),
      viewed: count(participations.firstViewedAt),
    })
    .from(participations)
    .where(eq(participations.secretSantaId, editionId));
  return { participants: row?.participants ?? 0, viewed: row?.viewed ?? 0 };
};

/** First names of those who have not discovered their result yet. */
export const missingViewers = async (
  db: Db,
  editionId: string,
): Promise<string[]> =>
  (
    await db
      .select({ firstName: persons.firstName })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(
        and(
          eq(participations.secretSantaId, editionId),
          isNull(participations.firstViewedAt),
        ),
      )
      .orderBy(asc(persons.firstName))
  ).map((row) => row.firstName);

/** Drawn editions not reminded yet, with their group. */
export const editionsToRemind = (db: Db) =>
  db
    .select({ edition: secretSantas, group: parties })
    .from(secretSantas)
    .innerJoin(parties, eq(parties.id, secretSantas.partyId))
    .where(
      and(
        eq(secretSantas.status, 'drawn'),
        isNull(secretSantas.reminderSentAt),
      ),
    )
    // Bounded (lot 38 A): the most recent first, where the due ones are.
    .orderBy(desc(secretSantas.createdAt))
    .limit(SCHEDULED.remindersRead);
