import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireParticipation } from '#server/http/participation';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { canSendLinks } from '#server/utils/editions';
import { MESSAGE_TYPES, messageTypesFor } from '#server/utils/messages';

// Called right after the guardian shared or copied a message: marks the
// participant as "sent" and journals it (README 13).
const bodySchema = z.object({
  type: z.enum(MESSAGE_TYPES),
  via: z.enum(['share', 'copy']),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition, person, participation } =
    await requireParticipation(event);
  if (!canSendLinks(edition.status)) {
    throw createError({ statusCode: 409, statusMessage: 'edition_closed' });
  }
  const { type, via } = await validatedBody(event, bodySchema);
  if (!messageTypesFor(edition.status, edition.drawMode).includes(type)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'message_not_available',
    });
  }
  await db
    .update(participations)
    .set({ messageSentAt: nowIso() })
    .where(eq(participations.id, participation.id));
  await recordEvent(db, {
    type: 'message_sent',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: user.role,
    // Who sent it (ticket 170).
    meta: { messageType: type, via, by: user.accountId },
  });
  return { ok: true };
});
