import { z } from 'zod';
import { tickIdea } from '#server/http/claims';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { LIST_NOTE_MAX } from '#server/utils/lists';

// The one who holds a list ticks in its document too (README 22.19), a
// draft included: alone, under their own name, or joining a gift given
// by several, whose sheet the screen showed first. Their « Moi » too.
const bodySchema = z.object({
  ideaId: z.string().min(1),
  note: z.string().trim().max(LIST_NOTE_MAX).nullable().default(null),
});

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const { ideaId, note } = await validatedBody(event, bodySchema);
  const joined = await tickIdea(db, list, user.accountId, {
    ideaId,
    mode: 'alone',
    anonymous: false,
    note,
  });
  setResponseStatus(event, 201);
  return { ok: true, joined };
});
