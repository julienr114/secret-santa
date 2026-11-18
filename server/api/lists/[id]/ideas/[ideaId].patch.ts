import { eq } from 'drizzle-orm';
import { findIdea } from '#server/database/lists';
import { giftListIdeas } from '#server/database/schema';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { splitIdea } from '#server/utils/lists';
import { ideaPatchSchema } from '#server/utils/listSchemas';

// An idea corrected by touching it, even once ticked (README 22.19); an
// address pasted in it becomes its link.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  const idea = await findIdea(
    db,
    list.id,
    getRouterParam(event, 'ideaId') ?? '',
  );
  if (!idea) throw notFound();
  const body = await validatedBody(event, ideaPatchSchema);
  const split = body.text === undefined ? null : splitIdea(body.text);
  await db
    .update(giftListIdeas)
    .set({
      ...(body.text === undefined ? {} : { text: split?.text ?? '' }),
      ...(body.url !== undefined
        ? { url: body.url }
        : split?.url
          ? { url: split.url }
          : {}),
    })
    .where(eq(giftListIdeas.id, idea.id));
  return { ok: true };
});
