import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  claimIfFree,
  claimsOfLists,
  joinClaim,
  recordVisit,
} from '#server/database/claims';
import { findIdea } from '#server/database/lists';
import { familyMembers, giftListPeople } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';
import { listOfLink } from '#server/http/listLink';
import { validatedBody } from '#server/http/validate';
import { canTick } from '#server/utils/claims';
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
  const idea = await findIdea(db, list.id, body.ideaId);
  if (!idea) throw notFound();
  // The holder never ticks the ideas meant for them.
  const forSelf = await db
    .select({ isSelf: familyMembers.isSelf })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(
      and(
        eq(giftListPeople.id, idea.listPersonId),
        eq(familyMembers.isSelf, true),
      ),
    )
    .get();
  const claims = (await claimsOfLists(db, [list.id])).filter(
    (c) => c.ideaId === idea.id,
  );
  const how = unwrap(
    canTick(
      claims,
      user.accountId,
      Boolean(forSelf) && list.accountId === user.accountId,
    ),
  );
  if (how === 'join') {
    await joinClaim(db, {
      listId: list.id,
      ideaId: idea.id,
      accountId: user.accountId,
      note: body.note,
    });
  } else {
    const written = await claimIfFree(db, {
      listId: list.id,
      ideaId: idea.id,
      accountId: user.accountId,
      mode: body.mode,
      anonymous: body.mode === 'alone' && body.anonymous,
      note: body.note,
    });
    if (!written) {
      throw createError({ statusCode: 409, statusMessage: 'taken' });
    }
  }
  if (user.accountId !== list.accountId) {
    await recordVisit(db, list.id, user.accountId);
  }
  setResponseStatus(event, 201);
  return { ok: true, joined: how === 'join' };
});
