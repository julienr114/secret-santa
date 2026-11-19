import { z } from 'zod';
import { requireAccount } from '#server/http/auth';
import { changeIdeaClaim } from '#server/http/claims';
import { listOfLink } from '#server/http/listLink';
import { validatedBody } from '#server/http/validate';
import { LIST_NOTE_MAX } from '#server/utils/lists';

// « Changer » (README 22.19, maquettes ListeReserver,
// ListeReserverPlusieurs, ListePlusieursOuvreur): alone or with others,
// telling the holder it is me, the word for the others, « On est au
// complet » for the one who leads.
const bodySchema = z
  .object({
    mode: z.enum(['alone', 'group']),
    anonymous: z.boolean(),
    note: z.string().trim().max(LIST_NOTE_MAX).nullable(),
    closed: z.boolean(),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  await changeIdeaClaim(
    db,
    list.id,
    user.accountId,
    getRouterParam(event, 'ideaId') ?? '',
    await validatedBody(event, bodySchema),
  );
  return { ok: true };
});
