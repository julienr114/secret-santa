import { and, count, eq } from 'drizzle-orm';
import type { Db } from './client';
import { newId } from '#server/http/context';
import { avatarOf, freshAvatar } from '#server/utils/avatars';
import { secureRandomInt } from '#server/utils/crypto';
import { personFromProfile, type ProfileAccount } from '#server/utils/people';
import {
  manualExclusions,
  persons,
  participations,
  type PersonRow,
} from './schema';

// Queries about the people of one group. Every query filters on group_id.

export const listPeople = (db: Db, groupId: string) =>
  db
    .select()
    .from(persons)
    .where(eq(persons.partyId, groupId))
    .orderBy(persons.firstName);

/**
 * How many active members a party has: what its 30 places count.
 * @param db - The database.
 * @param partyId - The party.
 * @returns Its members still in it, those without an address included.
 */
export const countActiveMembers = async (
  db: Db,
  partyId: string,
): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(persons)
    .where(and(eq(persons.partyId, partyId), eq(persons.active, true)));
  return row?.n ?? 0;
};

export const listExclusions = (db: Db, groupId: string) =>
  db
    .select()
    .from(manualExclusions)
    .where(eq(manualExclusions.partyId, groupId));

export const findPerson = async (
  db: Db,
  groupId: string,
  personId: string | undefined,
): Promise<PersonRow | null> => {
  if (!personId) return null;
  const [person] = await db
    .select()
    .from(persons)
    .where(and(eq(persons.partyId, groupId), eq(persons.id, personId)))
    .limit(1);
  return person ?? null;
};

export const hasParticipations = async (
  db: Db,
  personId: string,
): Promise<boolean> => {
  const [row] = await db
    .select({ id: participations.id })
    .from(participations)
    .where(eq(participations.personId, personId))
    .limit(1);
  return Boolean(row);
};

/**
 * Adds an account to a group as a person, copied from its profile, with
 * a random avatar when the profile has none.
 * @param db - Database.
 * @param input - Group, account (with the first name to use), date, and
 *   the id to give the person (a new one by default).
 * @returns The insert, to await.
 */
export const insertPersonFromAccount = async (
  db: Db,
  {
    groupId,
    account,
    now,
    id = newId(),
  }: { groupId: string; account: ProfileAccount; now: string; id?: string },
) => {
  const self = personFromProfile(account);
  // An icon nobody of the group has yet, unless the profile has one.
  const avatar = freshAvatar(
    (await listPeople(db, groupId)).map(avatarOf),
    secureRandomInt,
  );
  return db.insert(persons).values({
    ...self,
    id,
    partyId: groupId,
    avatarEmoji: self.avatarEmoji ?? avatar.emoji,
    avatarColor: self.avatarColor ?? avatar.color,
    active: true,
    createdAt: now,
  });
};
