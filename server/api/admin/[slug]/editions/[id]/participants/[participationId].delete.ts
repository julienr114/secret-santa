import { and, eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { deleteHintsOf } from '#server/database/hints';
import { deleteAnswersOfParticipations } from '#server/database/answers';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { notFound } from '#server/http/errors';
import { canEditParticipants } from '#server/utils/editions';

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (!canEditParticipants(edition.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'participants_locked',
    });
  }
  const id = getRouterParam(event, 'participationId') ?? '';
  const [row] = await db
    .select()
    .from(participations)
    .where(
      and(eq(participations.id, id), eq(participations.editionId, edition.id)),
    )
    .limit(1);
  if (!row) throw notFound('participation_not_found');
  await db.batch([
    ...deleteHintsOf(db, [row.id]),
    // Their answer to a draw made elsewhere goes with them; one naming
    // them stays, and counts for nothing while they are out (README 22.12).
    deleteAnswersOfParticipations(db, [row.id]),
    db.delete(participations).where(eq(participations.id, row.id)),
  ]);
  await recordEvent(db, {
    type: 'participant_removed',
    groupId: group.id,
    editionId: edition.id,
    personId: row.personId,
    actor: user.role,
  });
  return { ok: true };
});
