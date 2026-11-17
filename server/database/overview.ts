import { count, eq, ne, sql } from 'drizzle-orm';
import type { Db } from './client';
import { editions, groups, participations, persons } from './schema';
import { groupOverviews, type GroupOverview } from '#server/utils/overview';

// Members and draw in progress of every group, for the super-admin's
// lists. Whole tables grouped in SQL, never a list of ids: D1 caps the
// parameters of a query at 100.

/** The overview of every group of the app, by group id. */
export const loadGroupOverviews = async (
  db: Db,
): Promise<Record<string, GroupOverview>> => {
  const [groupRows, memberRows, editionRows, countRows] = await Promise.all([
    db.select({ id: groups.id }).from(groups),
    db
      .select({ groupId: persons.groupId, n: count() })
      .from(persons)
      .where(eq(persons.active, true))
      .groupBy(persons.groupId),
    db
      .select({
        id: editions.id,
        groupId: editions.groupId,
        year: editions.year,
        status: editions.status,
        createdAt: editions.createdAt,
      })
      .from(editions),
    db
      .select({
        editionId: participations.editionId,
        participants: count(),
        viewed: sql<number>`sum(case when ${participations.viewCount} > 0 then 1 else 0 end)`,
      })
      .from(participations)
      .innerJoin(editions, eq(editions.id, participations.editionId))
      .where(ne(editions.status, 'closed'))
      .groupBy(participations.editionId),
  ]);
  return groupOverviews(
    groupRows.map((row) => row.id),
    Object.fromEntries(memberRows.map((row) => [row.groupId, row.n])),
    editionRows,
    Object.fromEntries(
      countRows.map((row) => [
        row.editionId,
        { participants: row.participants, viewed: Number(row.viewed ?? 0) },
      ]),
    ),
  );
};
