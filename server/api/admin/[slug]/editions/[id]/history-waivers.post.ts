import { eq } from 'drizzle-orm';
import { secretSantas } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { validatedBody } from '#server/http/validate';
import {
  addWaiver,
  canEditParticipants,
  parseWaivers,
  waiverSchema,
} from '#server/utils/editions';

// Allows again, for this edition only, a pair excluded by a previous year.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (!canEditParticipants(edition.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'participants_locked',
    });
  }
  const waiver = await validatedBody(event, waiverSchema);
  const historyWaivers = addWaiver(
    parseWaivers(edition.historyWaivers),
    waiver,
  );
  await db
    .update(secretSantas)
    .set({ historyWaivers })
    .where(eq(secretSantas.id, edition.id));
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
  });
  return { historyWaivers };
});
