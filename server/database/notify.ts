import { SCHEDULED } from '#server/utils/limits';
import { and, asc, count, desc, eq, isNull } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  editions,
  groupMembers,
  groups,
  participations,
  persons,
} from './schema';

// What the emails to the organisers need (README 22.2).

/** The organisers of a group who can be written to, with their language. */
export const organizerRecipients = (db: Db, groupId: string) =>
  db
    .select({ email: accounts.email, language: accounts.language })
    .from(groupMembers)
    .innerJoin(accounts, eq(accounts.id, groupMembers.accountId))
    .where(and(eq(groupMembers.groupId, groupId), isNull(accounts.disabledAt)));

/** How many take part in an edition, and how many have looked. */
export const viewCounts = async (db: Db, editionId: string) => {
  const [row] = await db
    .select({
      participants: count(),
      viewed: count(participations.firstViewedAt),
    })
    .from(participations)
    .where(eq(participations.editionId, editionId));
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
          eq(participations.editionId, editionId),
          isNull(participations.firstViewedAt),
        ),
      )
      .orderBy(asc(persons.firstName))
  ).map((row) => row.firstName);

/** Drawn editions not reminded yet, with their group. */
export const editionsToRemind = (db: Db) =>
  db
    .select({ edition: editions, group: groups })
    .from(editions)
    .innerJoin(groups, eq(groups.id, editions.groupId))
    .where(and(eq(editions.status, 'drawn'), isNull(editions.reminderSentAt)))
    // Bounded (lot 38 A): the most recent first, where the due ones are.
    .orderBy(desc(editions.createdAt))
    .limit(SCHEDULED.remindersRead);
