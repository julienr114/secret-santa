import { z } from 'zod';
import { changeClaim, claimsOfLists } from '#server/database/claims';
import { requireAccount } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { listOfLink } from '#server/http/listLink';
import { validatedBody } from '#server/http/validate';
import { canChange } from '#server/utils/claims';
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
  const ideaId = getRouterParam(event, 'ideaId') ?? '';
  const change = await validatedBody(event, bodySchema);
  const claims = (await claimsOfLists(db, [list.id])).filter(
    (c) => c.ideaId === ideaId,
  );
  await changeClaim(
    db,
    ideaId,
    user.accountId,
    unwrap(canChange(claims, user.accountId, change)),
  );
  return { ok: true };
});
