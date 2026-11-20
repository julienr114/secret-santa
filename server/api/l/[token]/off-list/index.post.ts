import { z } from 'zod';
import { addOffList, recordVisit } from '#server/database/claims';
import { findListPerson } from '#server/database/lists';
import { countOffList } from '#server/database/caps';
import { ticksAnonymous } from '#server/http/anonymous';
import { requireAccount } from '#server/http/auth';
import { requireRoom } from '#server/http/caps';
import { notFound } from '#server/http/errors';
import { listOfLink } from '#server/http/listLink';
import { roleOnList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { IDEA_TEXT_MAX } from '#server/utils/lists';

// « J'offre autre chose à Léo » (README 22.19, maquette ListeHorsListe):
// two words the holder alone reads; the others see a surprise.
const bodySchema = z.object({
  listPersonId: z.string().min(1),
  text: z.string().trim().min(1).max(IDEA_TEXT_MAX),
  // Not said: my « mode anonyme » for this list decides (lot 27 ter).
  anonymous: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  const body = await validatedBody(event, bodySchema);
  if (!(await findListPerson(db, list.id, body.listPersonId))) throw notFound();
  await requireRoom('off_list', countOffList(db, list.id, user.accountId));
  await addOffList(db, {
    listId: list.id,
    accountId: user.accountId,
    ...body,
    anonymous:
      body.anonymous ?? (await ticksAnonymous(db, list.id, user.accountId)),
  });
  const { role } = await roleOnList(db, list, user.accountId);
  if (role !== 'holder') await recordVisit(db, list.id, user.accountId);
  setResponseStatus(event, 201);
  return { ok: true };
});
