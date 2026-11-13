import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { requireParticipation } from '#server/http/participation';

// "Pas envoyé finalement ?": undo the sent badge after a wrong tap.
export default defineEventHandler(async (event) => {
  const { db, participation } = await requireParticipation(event);
  await db
    .update(participations)
    .set({ messageSentAt: null })
    .where(eq(participations.id, participation.id));
  return { ok: true };
});
