import { invitesOfList, renewInvite } from '#server/database/lists';
import { nowIso, secretsOf } from '#server/http/context';
import { notFound } from '#server/http/errors';
import { freshInviteLink, sendHolderInvite } from '#server/http/listInvite';
import { requireManagedList } from '#server/http/lists';
import { inviteState } from '#server/utils/listAccess';

// « Renvoyer » an invitation that expired (lot 25 bis, README 22.20): 7
// more days, a new link, a new email, the same level. Only an expired
// one: one still waiting has its email already.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireManagedList(event, 'invite');
  const id = getRouterParam(event, 'inviteId') ?? '';
  const invite = (await invitesOfList(db, list.id)).find((i) => i.id === id);
  if (!invite) throw notFound();
  if (inviteState(invite, nowIso()) !== 'expired') {
    throw createError({ statusCode: 409, statusMessage: 'invite_not_expired' });
  }
  const { token, tokenHash, expiresAt } = await freshInviteLink();
  await renewInvite(db, invite.id, {
    invitedBy: user.accountId,
    tokenHash,
    expiresAt,
  });
  const link = await sendHolderInvite(event, db, {
    title: list.title,
    email: invite.email,
    level: invite.level,
    byAccountId: user.accountId,
    token,
    expiresAt,
  });
  return secretsOf(event).devLoginLinks
    ? { ok: true, devLink: link }
    : { ok: true };
});
