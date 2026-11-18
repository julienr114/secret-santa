import { and, eq, inArray, isNull, ne, type SQLWrapper } from 'drizzle-orm';
import type { Db } from './client';
import { editions, guesses, participations } from './schema';
import type { Guess } from '#server/utils/guesses';

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
  (await db.select().from(guesses).where(eq(guesses.editionId, editionId))).map(
    toGuess,
  );

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
          eq(guesses.editionId, editionId),
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
        .where(eq(guesses.editionId, editionId))
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
          eq(guesses.editionId, editionId),
          eq(guesses.guesserPersonId, guesserId),
        ),
      ),
    // One statement per guess: D1 caps the parameters of a statement.
    ...mine.map((g) =>
      db.insert(guesses).values({
        id: newId(),
        editionId,
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
        ? inArray(guesses.editionId, editionIds)
        : inArray(guesses.editionId, editionIds),
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
    .from(editions)
    .where(
      and(
        ne(editions.guessMode, 'none'),
        eq(editions.status, 'drawn'),
        isNull(editions.guessResultsSentAt),
      ),
    );

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
