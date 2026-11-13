import { eq } from 'drizzle-orm';
import { editions } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { canEditParticipants } from '#server/utils/editions';

// "Tout rétablir": every previous-year exclusion applies again.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (!canEditParticipants(edition.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'participants_locked',
    });
  }
  await db
    .update(editions)
    .set({ historyWaivers: null })
    .where(eq(editions.id, edition.id));
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
  });
  return { historyWaivers: [] };
});
