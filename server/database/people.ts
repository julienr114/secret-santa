import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import { newId } from '#server/http/context';
import { randomAvatar } from '#server/utils/avatars';
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
    .where(eq(persons.groupId, groupId))
    .orderBy(persons.firstName);

export const listExclusions = (db: Db, groupId: string) =>
  db
    .select()
    .from(manualExclusions)
    .where(eq(manualExclusions.groupId, groupId));

export const findPerson = async (
  db: Db,
  groupId: string,
  personId: string | undefined,
): Promise<PersonRow | null> => {
  if (!personId) return null;
  const [person] = await db
    .select()
    .from(persons)
    .where(and(eq(persons.groupId, groupId), eq(persons.id, personId)))
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
export const insertPersonFromAccount = (
  db: Db,
  {
    groupId,
    account,
    now,
    id = newId(),
  }: { groupId: string; account: ProfileAccount; now: string; id?: string },
) => {
  const self = personFromProfile(account);
  const avatar = randomAvatar(secureRandomInt);
  return db.insert(persons).values({
    ...self,
    id,
    groupId,
    avatarEmoji: self.avatarEmoji ?? avatar.emoji,
    avatarColor: self.avatarColor ?? avatar.color,
    active: true,
    createdAt: now,
  });
};
