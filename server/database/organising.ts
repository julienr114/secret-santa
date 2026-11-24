import { and, count, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  parties,
  partyOrganisers,
  partyYears,
  persons,
  secretSantas,
} from './schema';
import { isGroup } from './groups';

// « Pour quelle occasion ? » of a Secret Santa (docs/spec/v3/
// accueil-et-creation.md): the parties I organise, never those where I am
// only a member.

export type OrganisedParty = {
  slug: string;
  name: string;
  category: (typeof parties.$inferSelect)['category'];
  iconEmoji: string | null;
  members: number;
  /** It already has a Secret Santa in its year: a new one is another. */
  hasSecretSanta: boolean;
};

/**
 * The parties an account organises, by name, with their active members
 * and whether their year already has a Secret Santa.
 * @param db - The database.
 * @param accountId - The account.
 * @returns One entry per party.
 */
export const listOrganisedParties = async (
  db: Db,
  accountId: string,
): Promise<OrganisedParty[]> => {
  const rows = await db
    .select({
      id: parties.id,
      slug: parties.slug,
      name: parties.name,
      category: parties.category,
      iconEmoji: parties.iconEmoji,
    })
    .from(partyOrganisers)
    .innerJoin(parties, eq(parties.id, partyOrganisers.partyId))
    .where(and(eq(partyOrganisers.accountId, accountId), isGroup))
    .orderBy(parties.name);
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const [members, years, santas] = await Promise.all([
    db
      .select({ partyId: persons.partyId, n: count() })
      .from(persons)
      .where(and(inArray(persons.partyId, ids), eq(persons.active, true)))
      .groupBy(persons.partyId),
    db
      .select({ id: partyYears.id, partyId: partyYears.partyId })
      .from(partyYears)
      .where(inArray(partyYears.partyId, ids))
      .orderBy(desc(partyYears.year)),
    db
      .select({ yearId: secretSantas.yearId })
      .from(secretSantas)
      .where(inArray(secretSantas.partyId, ids)),
  ]);
  const membersOf = new Map(members.map((row) => [row.partyId, row.n]));
  // The year of a party now is its latest one, as on its page.
  const yearOf = new Map(
    years.toReversed().map((year) => [year.partyId, year.id]),
  );
  const withSanta = new Set(santas.map((santa) => santa.yearId));
  return rows.map(({ id, ...party }) => ({
    ...party,
    members: membersOf.get(id) ?? 0,
    hasSecretSanta: withSanta.has(yearOf.get(id) ?? ''),
  }));
};
