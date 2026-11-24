import { SCHEDULED } from '#server/utils/limits';
import {
  and,
  asc,
  eq,
  inArray,
  isNull,
  ne,
  type SQLWrapper,
} from 'drizzle-orm';
import type { Db } from './client';
import { secretSantas, guesses, participations, persons } from './schema';
import type { Guess } from '#server/utils/guesses';
import type { GameMember } from '#server/utils/nudges';

// The guesses of « Devine qui » (README 22.17). Never returned to anyone
// but their author before the reveal; the routes check it.

const toGuess = (row: typeof guesses.$inferSelect): Guess => ({
  guesserId: row.guesserPersonId,
  recipientId: row.recipientPersonId,
  giverId: row.giverPersonId,
  at: row.updatedAt,
  previous: row.previousGiverIds ?? [],
});

/**
 * Every guess of an edition.
 * @param db - The database.
 * @param editionId - The edition.
 * @returns The guesses.
 */
export const listGuesses = async (db: Db, editionId: string) =>
  (
    await db.select().from(guesses).where(eq(guesses.secretSantaId, editionId))
  ).map(toGuess);

/**
 * One player's guesses.
 * @param db - The database.
 * @param editionId - The edition.
 * @param guesserId - The player (a person).
 * @returns Their guesses.
 */
export const guessesOf = async (db: Db, editionId: string, guesserId: string) =>
  (
    await db
      .select()
      .from(guesses)
      .where(
        and(
          eq(guesses.secretSantaId, editionId),
          eq(guesses.guesserPersonId, guesserId),
        ),
      )
  ).map(toGuess);

/**
 * Those who made at least one guess: who has played, never what.
 * @param db - The database.
 * @param editionId - The edition.
 * @returns The persons who played.
 */
export const playersOf = async (db: Db, editionId: string) =>
  new Set(
    (
      await db
        .selectDistinct({ id: guesses.guesserPersonId })
        .from(guesses)
        .where(eq(guesses.secretSantaId, editionId))
    ).map((row) => row.id),
  );

/**
 * The statements that replace one player's guesses, each with its time
 * and its earlier answers.
 * @param db - The database.
 * @param editionId - The edition.
 * @param guesserId - The player.
 * @param mine - Their guesses afterwards.
 * @param ids - New ids, and the time.
 * @returns The statements, for one batch.
 */
export const replaceGuessesOf = (
  db: Db,
  editionId: string,
  guesserId: string,
  mine: Guess[],
  { newId, now }: { newId: () => string; now: string },
) =>
  [
    db
      .delete(guesses)
      .where(
        and(
          eq(guesses.secretSantaId, editionId),
          eq(guesses.guesserPersonId, guesserId),
        ),
      ),
    // One statement per guess: D1 caps the parameters of a statement.
    ...mine.map((g) =>
      db.insert(guesses).values({
        id: newId(),
        secretSantaId: editionId,
        guesserPersonId: g.guesserId,
        recipientPersonId: g.recipientId,
        giverPersonId: g.giverId,
        // An answer unchanged keeps its time (« Sur le fil »).
        updatedAt: g.at ?? now,
        previousGiverIds: g.previous ?? [],
      }),
    ),
  ] as const;

/**
 * The statement that deletes the guesses of some editions: a cancelled
 * draw, the game turned off, a deleted group.
 * @param db - The database.
 * @param editionIds - The editions, or a query giving them.
 * @returns The statement, for a batch.
 */
export const deleteGuessesOf = (db: Db, editionIds: string[] | SQLWrapper) =>
  db
    .delete(guesses)
    .where(
      Array.isArray(editionIds)
        ? inArray(guesses.secretSantaId, editionIds)
        : inArray(guesses.secretSantaId, editionIds),
    );

/**
 * The editions whose game the scheduled task looks after: on, drawn, and
 * either not closed yet or not revealed yet.
 * @param db - The database.
 * @returns The editions.
 */
export const gamesToWatch = (db: Db) =>
  db
    .select()
    .from(secretSantas)
    .where(
      and(
        ne(secretSantas.guessMode, 'none'),
        eq(secretSantas.status, 'drawn'),
        isNull(secretSantas.guessResultsSentAt),
      ),
    )
    // Bounded (lot 38 A): the soonest to end first; a game looked after
    // leaves the set, and the next ones come.
    .orderBy(asc(secretSantas.guessEndsAt))
    .limit(SCHEDULED.gamesPerRun);

/**
 * Marks that a participant watched the results.
 * @param db - The database.
 * @param participationId - The participation.
 * @param now - The time.
 * @returns Once marked.
 */
export const markResultsSeen = (db: Db, participationId: string, now: string) =>
  db
    .update(participations)
    .set({ guessResultsSeenAt: now })
    .where(eq(participations.id, participationId));

/**
 * The participants of an edition as the reminders of « Devine qui » see
 * them (Correction 15): played, only their own Santa, passed their turn.
 * Never what they guessed.
 * @param db - The database.
 * @param editionId - The edition.
 * @returns One line per participant, with their person and participation.
 */
export const gameMembers = async (db: Db, editionId: string) => {
  const [rows, all] = await Promise.all([
    db
      .select({ participation: participations, person: persons })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(eq(participations.secretSantaId, editionId)),
    listGuesses(db, editionId),
  ]);
  return rows.map(({ participation, person }) => {
    const own = all.filter((g) => g.guesserId === person.id);
    const member: GameMember = {
      id: person.id,
      email: person.email,
      played: own.length > 0,
      ownOnly: own.length > 0 && own.every((g) => g.recipientId === person.id),
      skipped: Boolean(participation.guessSkippedAt),
    };
    return { ...member, participation, person };
  });
};
