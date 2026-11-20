import { z } from 'zod';
import { ticksAnonymous } from '#server/http/anonymous';
import { requireAccount } from '#server/http/auth';
import { anonymousRefusal } from '#server/utils/anonymous';
import { changeIdeaClaim } from '#server/http/claims';
import { listOfLink } from '#server/http/listLink';
import { validatedBody } from '#server/http/validate';
import { LIST_NOTE_MAX } from '#server/utils/lists';

// The sheet of what I give (README 22.19, Correction 30, maquettes
// ListeReserverSimple, ListeReserverAnonyme, ListeReserverPlusieurs):
// alone, alone and anonymous, or with others; the word for the others,
// « On est au complet » for the one who leads.
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
  const body = await validatedBody(event, bodySchema);
  // My « mode anonyme » on (Correction 30): « Je l'offre seul, en
  // anonyme » only. Back to alone from a group, the tick is anonymous.
  const anonymousMode = await ticksAnonymous(db, list.id, user.accountId);
  const refusal = anonymousRefusal(anonymousMode, body);
  if (refusal) throw createError({ statusCode: 409, statusMessage: refusal });
  await changeIdeaClaim(
    db,
    list.id,
    user.accountId,
    getRouterParam(event, 'ideaId') ?? '',
    anonymousMode && body.mode === 'alone'
      ? { ...body, anonymous: true }
      : body,
  );
  return { ok: true };
});
