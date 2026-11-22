import { eq, inArray } from 'drizzle-orm';
import {
  auditLog,
  hintRequests,
  participations,
  secretSantas,
} from '#server/database/schema';
import { deleteHintsOf } from '#server/database/hints';
import { deleteAnswersOfParticipations } from '#server/database/answers';
import { deleteGuessesOf } from '#server/database/guesses';
import { requireEdition } from '#server/http/edition';

// « Supprimer ce Secret Santa » (ticket 108, Q-008): one that is not drawn
// yet, with its participations and their personal links. Its people stay
// members of the event. Once drawn, it stays.
export default defineEventHandler(async (event) => {
  const { db, edition } = await requireEdition(event);
  if (edition.status !== 'preparing' || edition.drawnAt) {
    throw createError({ statusCode: 409, statusMessage: 'secret_santa_drawn' });
  }
  const participationIds = (
    await db
      .select({ id: participations.id })
      .from(participations)
      .where(eq(participations.secretSantaId, edition.id))
  ).map((row) => row.id);
  await db.batch([
    ...deleteHintsOf(db, participationIds),
    deleteAnswersOfParticipations(db, participationIds),
    deleteGuessesOf(db, [edition.id]),
    db.delete(hintRequests).where(eq(hintRequests.secretSantaId, edition.id)),
    db.delete(auditLog).where(eq(auditLog.secretSantaId, edition.id)),
    db
      .delete(participations)
      .where(
        inArray(
          participations.id,
          participationIds.length === 0 ? [''] : participationIds,
        ),
      ),
    db.delete(secretSantas).where(eq(secretSantas.id, edition.id)),
  ]);
  return { ok: true };
});
