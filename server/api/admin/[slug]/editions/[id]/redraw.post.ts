import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { editions, participations } from '#server/database/schema';
import { deleteAssignments } from '#server/database/draw';
import { recordEvent } from '#server/database/audit';
import { deleteHintRequestsOf } from '#server/database/hints';
import { requireEdition } from '#server/http/edition';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { CANCELLED_PARTICIPATION, nextStatus } from '#server/utils/editions';

// Cancel the draw (README 6.5): results gone, list editable again, links
// and codes kept, view counters reset, reason journaled. The requests for
// hints go with the draw: the new givers may each ask once.
const bodySchema = z.object({ reason: z.string().trim().min(3).max(200) });

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  const status = unwrap(nextStatus(edition.status, 'cancel_draw'));
  // Once revealed, who gave to whom is known: drawing again would not
  // make it secret again.
  if (edition.revealedAt) {
    throw createError({ statusCode: 409, statusMessage: 'results_revealed' });
  }
  const { reason } = await validatedBody(event, bodySchema);
  await db.batch([
    deleteAssignments(db, edition.id),
    deleteHintRequestsOf(db, edition.id),
    db
      .update(editions)
      .set({ status, drawnAt: null, rulesSnapshot: null })
      .where(eq(editions.id, edition.id)),
    db
      .update(participations)
      .set({ ...CANCELLED_PARTICIPATION })
      .where(eq(participations.editionId, edition.id)),
  ]);
  await recordEvent(db, {
    type: 'draw_cancelled',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { reason },
  });
  return { status };
});
