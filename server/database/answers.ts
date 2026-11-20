import { and, eq, inArray, type SQLWrapper } from 'drizzle-orm';
import type { Db } from './client';
import { drawAnswers, participations, persons } from './schema';
import { decrypt, encrypt } from '#server/utils/crypto';
import { answersState, type Answer } from '#server/utils/answers';

// The answers of a draw made elsewhere (README 22.12). Receivers are
// encrypted like a draw's and decrypted here only: to check the answers
// fit together, to validate them, or for the participant's own answer.
// No organiser route ever returns one.

/**
 * Every answer of an edition, decrypted, by person; those that cannot be
 * read count as not given.
 * @param db - The database.
 * @param editionId - The edition.
 * @param dataKey - The server key.
 * @returns The answers.
 */
export const findAnswers = async (
  db: Db,
  editionId: string,
  dataKey: CryptoKey,
): Promise<Answer[]> => {
  const rows = await db
    .select({
      giverId: participations.personId,
      receiverEnc: drawAnswers.receiverEnc,
      receiverIv: drawAnswers.receiverIv,
    })
    .from(drawAnswers)
    .innerJoin(
      participations,
      eq(participations.id, drawAnswers.participationId),
    )
    .where(eq(drawAnswers.secretSantaId, editionId));
  const answers = await Promise.all(
    rows.map(async (row) => {
      const receiver = await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      );
      return receiver.ok
        ? [{ giverId: row.giverId, receiverId: receiver.value }]
        : [];
    }),
  );
  return answers.flat();
};

/**
 * Whether a participation has saved an answer, without reading it.
 * @param db - The database.
 * @param participationId - The participation.
 * @returns True when an answer is saved.
 */
export const hasAnswer = async (db: Db, participationId: string) => {
  const [row] = await db
    .select({ id: drawAnswers.participationId })
    .from(drawAnswers)
    .where(eq(drawAnswers.participationId, participationId))
    .limit(1);
  return Boolean(row);
};

/**
 * Saves a participant's answer, or replaces it.
 * @param db - The database.
 * @param answer - Whose answer, in which edition, naming which person.
 * @param dataKey - The server key.
 * @param now - The time of the answer.
 * @returns Once saved.
 */
export const saveAnswer = async (
  db: Db,
  answer: {
    participationId: string;
    editionId: string;
    receiverPersonId: string;
  },
  dataKey: CryptoKey,
  now: string,
) => {
  const { enc, iv } = await encrypt(answer.receiverPersonId, dataKey);
  const values = {
    participationId: answer.participationId,
    secretSantaId: answer.editionId,
    receiverEnc: enc,
    receiverIv: iv,
    answeredAt: now,
  };
  await db
    .insert(drawAnswers)
    .values(values)
    .onConflictDoUpdate({
      target: drawAnswers.participationId,
      set: { receiverEnc: enc, receiverIv: iv, answeredAt: now },
    });
};

/**
 * The statement that deletes the answers of an edition.
 * @param db - The database.
 * @param editionId - The edition.
 * @returns The statement, for a batch.
 */
export const deleteAnswersOf = (db: Db, editionId: string) =>
  db.delete(drawAnswers).where(and(eq(drawAnswers.secretSantaId, editionId)));

/**
 * The statement that deletes the answers of some participations, before
 * they are deleted themselves.
 * @param db - The database.
 * @param participationIds - The participations, or a query giving them.
 * @returns The statement, for a batch.
 */
export const deleteAnswersOfParticipations = (
  db: Db,
  participationIds: string[] | SQLWrapper,
) =>
  db
    .delete(drawAnswers)
    .where(
      Array.isArray(participationIds)
        ? inArray(drawAnswers.participationId, participationIds)
        : inArray(drawAnswers.participationId, participationIds),
    );

/**
 * The persons taking part in an edition, for the participant's choice and
 * for the progress of the answers.
 * @param db - The database.
 * @param editionId - The edition.
 * @returns Their person rows.
 */
export const editionPersons = async (db: Db, editionId: string) =>
  (
    await db
      .select({ person: persons })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(eq(participations.secretSantaId, editionId))
  ).map((row) => row.person);

/**
 * Where the answers of an edition stand: who answered, who clashes,
 * whether the last one follows. Never what anyone answered.
 * @param db - The database.
 * @param editionId - The edition.
 * @param dataKey - The server key.
 * @returns The state.
 */
export const answersOfEdition = async (
  db: Db,
  editionId: string,
  dataKey: CryptoKey,
) =>
  answersState(
    (await editionPersons(db, editionId)).map((p) => p.id),
    await findAnswers(db, editionId, dataKey),
  );
