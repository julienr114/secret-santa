import { count, eq, ne, sql } from 'drizzle-orm';
import type { Db } from './client';
import {
  partyYears,
  secretSantas,
  parties,
  participations,
  persons,
} from './schema';
import { groupOverviews, type GroupOverview } from '#server/utils/overview';

// Members and draw in progress of every group, for the super-admin's
// lists. Whole tables grouped in SQL, never a list of ids: D1 caps the
// parameters of a query at 100.

/** The overview of every group of the app, by group id. */
export const loadGroupOverviews = async (
  db: Db,
): Promise<Record<string, GroupOverview>> => {
  const [groupRows, memberRows, editionRows, countRows] = await Promise.all([
    db
      .select({ id: parties.id })
      .from(parties)
      .where(eq(parties.fromList, false)),
    db
      .select({ groupId: persons.partyId, n: count() })
      .from(persons)
      .where(eq(persons.active, true))
      .groupBy(persons.partyId),
    db
      .select({
        id: secretSantas.id,
        groupId: secretSantas.partyId,
        year: partyYears.year,
        status: secretSantas.status,
        createdAt: secretSantas.createdAt,
      })
      .from(secretSantas)
      .innerJoin(partyYears, eq(partyYears.id, secretSantas.yearId)),
    db
      .select({
        editionId: participations.secretSantaId,
        participants: count(),
        viewed: sql<number>`sum(case when ${participations.viewCount} > 0 then 1 else 0 end)`,
      })
      .from(participations)
      .innerJoin(
        secretSantas,
        eq(secretSantas.id, participations.secretSantaId),
      )
      .where(ne(secretSantas.status, 'closed'))
      .groupBy(participations.secretSantaId),
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
