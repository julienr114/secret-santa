import { and, desc, eq, ne } from 'drizzle-orm';
import type { Db } from './client';
import { editions, groups, participations, persons } from './schema';

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
    })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .innerJoin(editions, eq(editions.id, participations.editionId))
    .innerJoin(groups, eq(groups.id, editions.groupId))
    .where(and(eq(persons.email, email), ne(editions.status, 'draft')))
    .orderBy(desc(editions.year), desc(editions.createdAt));
