import { z } from 'zod';
import { findAccountById } from '#server/database/accounts';
import {
  addInvite,
  findMember,
  holdersOfLists,
  invitesOfList,
} from '#server/database/lists';
import { nowIso, secretsOf } from '#server/http/context';
import { freshInviteLink, sendHolderInvite } from '#server/http/listInvite';
import { requireManagedList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import {
  HOLDER_LEVELS,
  inviteRefusal,
  inviteState,
} from '#server/utils/listAccess';
import { emailSchema } from '#server/utils/people';

// « Inviter quelqu'un » to hold the list (lot 25 bis, README 22.20), for
// those who manage it: one of my people linked to an account, chosen by
// their pill, or an address. « Aider à écrire » unless said otherwise.
// An email carries the link of the invitation, good for 7 days; an
// invitation expired or refused is replaced.
const bodySchema = z
  .object({
    email: emailSchema.optional(),
    memberId: z.string().min(1).max(40).optional(),
    level: z.enum(HOLDER_LEVELS).default('write'),
  })
  .refine((body) => Boolean(body.email) !== Boolean(body.memberId));

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireManagedList(event, 'invite');
  const body = await validatedBody(event, bodySchema);
  // One of my people: the address is the one of their account.
  const member = body.memberId
    ? await findMember(db, user.accountId, body.memberId)
    : null;
  const linked = member?.linkedAccountId
    ? await findAccountById(db, member.linkedAccountId)
    : null;
  const email = body.email ?? linked?.email;
  if (!email) {
    throw createError({ statusCode: 404, statusMessage: 'member_not_linked' });
  }
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const now = nowIso();
  const refusal = inviteRefusal(email, {
    holderEmails: holders.map((holder) => holder.email),
    invitedEmails: (await invitesOfList(db, list.id))
      .filter((invite) => inviteState(invite, now) === 'waiting')
      .map((invite) => invite.email),
  });
  if (refusal) {
    throw createError({
      statusCode: 409,
      statusMessage: `already_${refusal}`,
    });
  }
  const { token, tokenHash, expiresAt } = await freshInviteLink();
  await addInvite(db, {
    listId: list.id,
    email,
    invitedBy: user.accountId,
    level: body.level,
    tokenHash,
    expiresAt,
  });
  const link = await sendHolderInvite(event, db, {
    listId: list.id,
    title: list.title,
    email,
    level: body.level,
    byAccountId: user.accountId,
    token,
    expiresAt,
  });
  setResponseStatus(event, 201);
  return secretsOf(event).devLoginLinks
    ? { ok: true, devLink: link }
    : { ok: true };
});
