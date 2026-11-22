import { z } from 'zod';
import { recordVisit } from '#server/database/claims';
import { tellJoinedGift, tellTicked } from '#server/database/newsEvents';
import { nowIso } from '#server/http/context';
import { requireAccount } from '#server/http/auth';
import { ticksAnonymous } from '#server/http/anonymous';
import { anonymousRefusal } from '#server/utils/anonymous';
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
  // Not said: my « mode anonyme » for this list decides (lot 27 ter).
  anonymous: z.boolean().optional(),
  note: z.string().trim().max(LIST_NOTE_MAX).nullable().default(null),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  const body = await validatedBody(event, bodySchema);
  // My « mode anonyme » on: alone and anonymous only (Correction 30).
  const anonymousMode = await ticksAnonymous(db, list.id, user.accountId);
  const refusal = anonymousRefusal(anonymousMode, body);
  if (refusal) throw createError({ statusCode: 409, statusMessage: refusal });
  const joined = await tickIdea(db, list, user.accountId, {
    ...body,
    anonymous: body.anonymous ?? anonymousMode,
    anonymousMode,
  });
  const { role } = await roleOnList(db, list, user.accountId);
  if (role !== 'holder') await recordVisit(db, list.id, user.accountId);
  // The news (ticket 120): those who hold it are told of a tick, the one
  // who leads a gift given by several of who joins it.
  if (joined) {
    await tellJoinedGift(
      db,
      { listId: list.id, ideaId: body.ideaId, by: user.accountId },
      nowIso(),
    );
  } else if (role !== 'holder') {
    await tellTicked(db, { listId: list.id, by: user.accountId }, nowIso());
  }
  setResponseStatus(event, 201);
  return { ok: true, joined };
});
