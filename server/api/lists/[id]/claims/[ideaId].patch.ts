import { z } from 'zod';
import { changeIdeaClaim } from '#server/http/claims';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { LIST_NOTE_MAX } from '#server/utils/lists';

// « Changer », for the one who holds the list, in its document, a draft
// included (README 22.19): alone or with others, the word for the others,
// « On est au complet ». No staying anonymous: the holder is the one who
// reads the names.
const bodySchema = z
  .object({
    mode: z.enum(['alone', 'group']),
    note: z.string().trim().max(LIST_NOTE_MAX).nullable(),
    closed: z.boolean(),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  await changeIdeaClaim(
    db,
    list.id,
    user.accountId,
    getRouterParam(event, 'ideaId') ?? '',
    await validatedBody(event, bodySchema),
  );
  return { ok: true };
});
