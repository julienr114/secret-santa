import { and, count, eq } from 'drizzle-orm';
import type { Db } from './client';
import {
  canEditParticipants,
  checkParticipantCount,
  currentEdition,
} from '#server/utils/editions';
import { recordEvent } from './audit';
import { newParticipation } from './editions';
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

/**
 * Puts someone who just joined by the link in the draw being prepared
 * (decided on 17 November 2026), unless they are in it already, the draw
 * is done, or it is full. The group reads it in the journal.
 * @param db - Database.
 * @param input - The current edition, the person, the key of the links.
 * @returns Their participation in the edition, or null when not in it.
 */
export const joinDrawInPreparation = async (
  db: Db,
  {
    edition,
    personId,
    dataKey,
  }: {
    edition: typeof editions.$inferSelect | null;
    personId: string;
    dataKey: CryptoKey;
  },
) => {
  if (!edition) return null;
  const existing = await findParticipationOf(db, edition.id, personId);
  if (existing) return existing;
  if (!canEditParticipants(edition.status)) return null;
  const size = await participantCount(db, edition.id);
  if (!checkParticipantCount(size + 1).ok) return null;
  const row = await newParticipation(
    { editionId: edition.id, personId },
    dataKey,
  );
  await db.insert(participations).values(row);
  await recordEvent(db, {
    type: 'participant_added',
    groupId: edition.groupId,
    editionId: edition.id,
    personId,
    actor: 'participant',
  });
  return row;
};
