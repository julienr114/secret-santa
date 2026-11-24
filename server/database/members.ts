import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { listPeople } from './people';
import { findPersonByGroupEmail } from './invite';
import { memberEntries, persons, type PersonRow } from './schema';
import { newId } from '#server/http/context';
import { avatarOf, freshAvatar } from '#server/utils/avatars';
import { secureRandomInt } from '#server/utils/crypto';

// Coming into an event (ticket 117, docs/decisions/2026-11-21-on-entre-
// par-un-secret-santa-ou-par-une-liste.md): one never comes into an event
// itself, always by one of its Secret Santa or by one of its lists, and
// the way in is kept for « Membres ». Every route that makes a member
// goes through here (`server/database/members.test.ts` checks it).

/** By where someone comes in: a Secret Santa, or a list. */
export type Via = { secretSantaId: string } | { listId: string };

/**
 * The row that keeps a way in.
 * @param input - The event, the person, by where, and when.
 * @param input.partyId - The event.
 * @param input.personId - The person.
 * @param input.via - The Secret Santa or the list.
 * @param input.now - ISO date.
 * @returns The row to insert.
 */
export const entryRow = ({
  partyId,
  personId,
  via,
  now,
}: {
  partyId: string;
  personId: string;
  via: Via;
  now: string;
}) => ({
  id: newId(),
  partyId,
  personId,
  secretSantaId: 'secretSantaId' in via ? via.secretSantaId : null,
  listId: 'listId' in via ? via.listId : null,
  createdAt: now,
});

/**
 * Keeps a way in, once: coming in twice by the same place changes
 * nothing.
 * @param db - The database.
 * @param input - The event, the person, by where, and when.
 * @returns The statement, to await or to batch.
 */
export const recordEntry = (db: Db, input: Parameters<typeof entryRow>[0]) =>
  db.insert(memberEntries).values(entryRow(input)).onConflictDoNothing();

/**
 * The statements that forget the ways in of some people.
 * @param db - The database.
 * @param where - The people, or a whole event.
 * @returns The statement.
 */
export const forgetEntries = (
  db: Db,
  where: { personIds: readonly string[] } | { partyId: string },
) =>
  db
    .delete(memberEntries)
    .where(
      'partyId' in where
        ? eq(memberEntries.partyId, where.partyId)
        : inArray(
            memberEntries.personId,
            where.personIds.length === 0 ? [''] : [...where.personIds],
          ),
    );

/** Who comes in: as an organiser writes them, or as another event has them. */
export type Newcomer = Pick<PersonRow, 'firstName'> &
  Partial<
    Pick<PersonRow, 'lastName' | 'language' | 'avatarEmoji' | 'avatarColor'>
  > & { email: string | null };

/**
 * Makes someone a member of an event by one of its Secret Santa or one of
 * its lists. Someone already there by that address stays who they are
 * (taken back in when they had been removed); anyone else is a new
 * person, with an icon nobody of the event has yet. The caller checks
 * the 30 places first: `placesTaken` says whether one was taken.
 * @param db - The database.
 * @param input - The event, who comes in, by where, and when.
 * @param input.partyId - The event.
 * @param input.newcomer - Who comes in.
 * @param input.via - The Secret Santa or the list.
 * @param input.now - ISO date.
 * @returns Their person, and whether they took a place.
 */
export const enterParty = async (
  db: Db,
  {
    partyId,
    newcomer,
    via,
    now,
  }: { partyId: string; newcomer: Newcomer; via: Via; now: string },
): Promise<{ personId: string; placeTaken: boolean }> => {
  const found = newcomer.email
    ? await findPersonByGroupEmail(db, partyId, newcomer.email)
    : null;
  if (found) {
    if (!found.active) {
      await db
        .update(persons)
        .set({ active: true })
        .where(and(eq(persons.id, found.id), eq(persons.partyId, partyId)));
    }
    await recordEntry(db, { partyId, personId: found.id, via, now });
    return { personId: found.id, placeTaken: !found.active };
  }
  const avatar = freshAvatar(
    (await listPeople(db, partyId)).map(avatarOf),
    secureRandomInt,
  );
  const id = newId();
  await db.batch([
    db.insert(persons).values({
      id,
      partyId,
      firstName: newcomer.firstName,
      lastName: newcomer.lastName ?? null,
      email: newcomer.email,
      language: newcomer.language ?? 'fr',
      avatarEmoji: newcomer.avatarEmoji ?? avatar.emoji,
      avatarColor: newcomer.avatarColor ?? avatar.color,
      active: true,
      createdAt: now,
    }),
    recordEntry(db, { partyId, personId: id, via, now }),
  ]);
  return { personId: id, placeTaken: true };
};
