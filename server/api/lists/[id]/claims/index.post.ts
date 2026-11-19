import { z } from 'zod';
import { tickIdea } from '#server/http/claims';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';

// The one who holds a list ticks in its document too (README 22.19), a
// draft included: alone, under their own name. Never the ideas meant for
// them.
const bodySchema = z.object({ ideaId: z.string().min(1) });

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const { ideaId } = await validatedBody(event, bodySchema);
  await tickIdea(db, list, user.accountId, {
    ideaId,
    mode: 'alone',
    anonymous: false,
    note: null,
  });
  setResponseStatus(event, 201);
  return { ok: true };
});
