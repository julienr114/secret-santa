import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { nowIso } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';

// The participant opened the journal from their page: the alerts counted
// there start again from now (lot 12 of the redesign). A POST, since
// reading never writes (README 8.3).
export default defineEventHandler(async (event) => {
  const { db, participation } = await requirePersonalLink(event);
  await db
    .update(participations)
    .set({ journalSeenAt: nowIso() })
    .where(eq(participations.id, participation.id));
  return { ok: true };
});
