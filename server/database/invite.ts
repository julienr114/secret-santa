import { and, count, eq } from 'drizzle-orm';
import type { Db } from './client';
import { checkParticipantCount } from '#server/utils/editions';
import { recordEvent } from './audit';
import {
  newParticipation,
  santaNameForSubject,
  selectEditions,
  type Edition,
} from './editions';
import { recordEntry } from './members';
import { parties, participations, persons, secretSantas } from './schema';

// Invitation links of a Secret Santa (ticket 116; README 22.2). An event
// has none: one signs up to a Secret Santa, and so becomes a member of its
// event.

/**
 * The Secret Santa behind an invitation code, with its event and its name
 * when the event has several the same year, or null.
 * @param db - Database.
 * @param code - The code of the link.
 * @returns The Secret Santa, its event, its name to say, or null.
 */
export const findInvite = async (db: Db, code: string) => {
  const [santa] = await selectEditions(db)
    .where(eq(secretSantas.inviteCode, code))
    .limit(1);
  if (!santa) return null;
  const [group] = await db
    .select()
    .from(parties)
    .where(eq(parties.id, santa.partyId))
    .limit(1);
  if (!group) return null;
  return { group, santa, santaName: await santaNameForSubject(db, santa) };
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
    .where(and(eq(persons.partyId, groupId), eq(persons.email, email)))
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
        eq(participations.secretSantaId, editionId),
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
    .where(eq(participations.secretSantaId, editionId));
  return row?.n ?? 0;
};

/**
 * Puts someone who signed up by the link in its Secret Santa, unless they
 * are in it already or it is full. The event reads it in the journal.
 * @param db - Database.
 * @param input - The Secret Santa (being prepared), the person, the key of
 *   the links.
 * @returns Their participation, or null when it is full.
 */
export const joinSecretSanta = async (
  db: Db,
  {
    santa,
    personId,
    dataKey,
  }: {
    santa: Edition;
    personId: string;
    dataKey: CryptoKey;
  },
) => {
  const existing = await findParticipationOf(db, santa.id, personId);
  if (existing) return existing;
  const size = await participantCount(db, santa.id);
  if (!checkParticipantCount(size + 1).ok) return null;
  const row = await newParticipation(
    { secretSantaId: santa.id, personId },
    dataKey,
  );
  await db.batch([
    db.insert(participations).values(row),
    recordEntry(db, {
      partyId: santa.partyId,
      personId,
      via: { secretSantaId: santa.id },
      now: new Date().toISOString(),
    }),
  ]);
  await recordEvent(db, {
    type: 'participant_added',
    groupId: santa.partyId,
    editionId: santa.id,
    personId,
    actor: 'participant',
  });
  return row;
};
