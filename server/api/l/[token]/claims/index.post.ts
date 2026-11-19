import { z } from 'zod';
import { recordVisit } from '#server/database/claims';
import { requireAccount } from '#server/http/auth';
import { tickIdea } from '#server/http/claims';
import { listOfLink } from '#server/http/listLink';
import { roleOnList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { LIST_NOTE_MAX } from '#server/utils/lists';

// Ticking an idea (README 22.19, maquette ListeVisiteurMes): alone and
// under my first name by default, at once, no sheet; or joining a gift
// given by several, whose sheet the screen showed first. Two accounts
// never give the same idea alone: the second one hears « c'est déjà pris ».
const bodySchema = z.object({
  ideaId: z.string().min(1),
  mode: z.enum(['alone', 'group']).default('alone'),
  anonymous: z.boolean().default(false),
  note: z.string().trim().max(LIST_NOTE_MAX).nullable().default(null),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  const body = await validatedBody(event, bodySchema);
  const joined = await tickIdea(db, list, user.accountId, body);
  const { role } = await roleOnList(db, list, user.accountId);
  if (role !== 'holder') await recordVisit(db, list.id, user.accountId);
  setResponseStatus(event, 201);
  return { ok: true, joined };
});
