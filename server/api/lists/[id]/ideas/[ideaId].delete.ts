import { eq } from 'drizzle-orm';
import { findIdea } from '#server/database/lists';
import { giftListIdeas } from '#server/database/schema';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';

// « Supprimer la ligne » (README 22.19). An idea already ticked asks for a
// confirmation on the screen first.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const idea = await findIdea(
    db,
    list.id,
    getRouterParam(event, 'ideaId') ?? '',
  );
  if (!idea) throw notFound();
  await db.delete(giftListIdeas).where(eq(giftListIdeas.id, idea.id));
  return { ok: true };
});
