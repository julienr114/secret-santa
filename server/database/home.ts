import { and, count, desc, eq, inArray, ne } from 'drizzle-orm';
import type { Db } from './client';
import { currentEdition, type EditionStatus } from '#server/utils/editions';
import { editions, groups, participations, persons, wishes } from './schema';

/**
 * The participations of the people registered with an address, in every
 * group, most recent edition first. Drafts are left out: their links are
 * not open yet.
 */
export const listParticipationsByEmail = (db: Db, email: string) =>
  db
    .select({
      participation: participations,
      edition: editions,
      person: persons,
      groupName: groups.name,
      groupRules: groups.rules,
    })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .innerJoin(editions, eq(editions.id, participations.editionId))
    .innerJoin(groups, eq(groups.id, editions.groupId))
    .where(and(eq(persons.email, email), ne(editions.status, 'draft')))
    .orderBy(desc(editions.year), desc(editions.createdAt));

/** How many ideas each participation wrote, by participation id. */
export const wishesCounts = async (
  db: Db,
  participationIds: string[],
): Promise<Record<string, number>> =>
  participationIds.length === 0
    ? {}
    : Object.fromEntries(
        (
          await db
            .select({ id: wishes.participationId, n: count() })
            .from(wishes)
            .where(inArray(wishes.participationId, participationIds))
            .groupBy(wishes.participationId)
        ).map((row) => [row.id, row.n]),
      );

/** Where the current edition of a group stands, for its organiser. */
export type EditionSummary = {
  label: string;
  status: EditionStatus;
  participants: number;
  /** How many were sent their message. */
  sent: number;
  /** How many opened their personal page at least once. */
  viewed: number;
};

/**
 * The current edition of each group, with its counts, by group id. A
 * group with only closed editions has none.
 */
export const currentEditionSummaries = async (
  db: Db,
  groupIds: string[],
): Promise<Record<string, EditionSummary>> => {
  if (groupIds.length === 0) return {};
  const rows = await db
    .select()
    .from(editions)
    .where(inArray(editions.groupId, groupIds));
  const current = groupIds.flatMap((groupId) => {
    const edition = currentEdition(rows.filter((e) => e.groupId === groupId));
    return edition ? [edition] : [];
  });
  if (current.length === 0) return {};
  const counts = await db
    .select({
      editionId: participations.editionId,
      participants: count(),
      sent: count(participations.messageSentAt),
      viewed: count(participations.firstViewedAt),
    })
    .from(participations)
    .where(
      inArray(
        participations.editionId,
        current.map((edition) => edition.id),
      ),
    )
    .groupBy(participations.editionId);
  return Object.fromEntries(
    current.map((edition) => {
      const row = counts.find((c) => c.editionId === edition.id);
      return [
        edition.groupId,
        {
          label: edition.label,
          status: edition.status,
          participants: row?.participants ?? 0,
          sent: row?.sent ?? 0,
          viewed: row?.viewed ?? 0,
        },
      ];
    }),
  );
};
