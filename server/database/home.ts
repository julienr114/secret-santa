import { desc, eq } from 'drizzle-orm';
import type { Db } from './client';
import {
  partyYears,
  secretSantas,
  parties,
  participations,
  persons,
} from './schema';
import { editionColumns } from './editions';

/**
 * The participations of the people registered with an address, in every
 * group, most recent edition first.
 */
export const listParticipationsByEmail = (db: Db, email: string) =>
  db
    .select({
      participation: participations,
      edition: editionColumns,
      person: persons,
      groupName: parties.name,
    })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .innerJoin(secretSantas, eq(secretSantas.id, participations.secretSantaId))
    .innerJoin(partyYears, eq(partyYears.id, secretSantas.yearId))
    .innerJoin(parties, eq(parties.id, secretSantas.partyId))
    .where(eq(persons.email, email))
    .orderBy(desc(partyYears.year), desc(secretSantas.createdAt));
