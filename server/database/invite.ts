import { and, count, eq } from 'drizzle-orm';
import type { Db } from './client';
import { currentEdition } from '#server/utils/editions';
import { editions, groups, participations, persons } from './schema';

// Invitation links of groups (README 22.2).

/**
 * The group behind an invitation code, with its current edition (the
 * newest one not closed), or null.
 */
export const findInvite = async (db: Db, code: string) => {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.inviteCode, code))
    .limit(1);
  if (!group) return null;
  const rows = await db
    .select()
    .from(editions)
    .where(eq(editions.groupId, group.id));
  return { group, edition: currentEdition(rows) };
};

/** The person of a group with this address, or null. */
export const findPersonByGroupEmail = async (
  db: Db,
  groupId: string,
  email: string,
) => {
  const [person] = await db
    .select()
    .from(persons)
    .where(and(eq(persons.groupId, groupId), eq(persons.email, email)))
    .limit(1);
  return person ?? null;
};

/** The participation of a person in an edition, or null. */
export const findParticipationOf = async (
  db: Db,
  editionId: string,
  personId: string,
) => {
  const [row] = await db
    .select()
    .from(participations)
    .where(
      and(
        eq(participations.editionId, editionId),
        eq(participations.personId, personId),
      ),
    )
    .limit(1);
  return row ?? null;
};

/** How many people take part in an edition. */
export const participantCount = async (
  db: Db,
  editionId: string,
): Promise<number> => {
  const [row] = await db
    .select({ n: count() })
    .from(participations)
    .where(eq(participations.editionId, editionId));
  return row?.n ?? 0;
};
