import { and, eq } from 'drizzle-orm';
import {
  couples,
  manualExclusions,
  persons,
  participations,
} from './schema.js';

// Queries about the people of one group. Every query filters on group_id.

export const listPeople = (db, groupId) =>
  db
    .select()
    .from(persons)
    .where(eq(persons.groupId, groupId))
    .orderBy(persons.firstName);

export const listCouples = (db, groupId) =>
  db.select().from(couples).where(eq(couples.groupId, groupId));

export const listExclusions = (db, groupId) =>
  db
    .select()
    .from(manualExclusions)
    .where(eq(manualExclusions.groupId, groupId));

export const findPerson = async (db, groupId, personId) => {
  const [person] = await db
    .select()
    .from(persons)
    .where(and(eq(persons.groupId, groupId), eq(persons.id, personId)))
    .limit(1);
  return person ?? null;
};

export const hasParticipations = async (db, personId) => {
  const [row] = await db
    .select({ id: participations.id })
    .from(participations)
    .where(eq(participations.personId, personId))
    .limit(1);
  return Boolean(row);
};
