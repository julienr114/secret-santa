import { declineInvite } from '#server/database/lists';
import { nowIso } from '#server/http/context';
import { invitationOfLink } from '#server/http/invitation';

// « Non merci » (lot 25 bis, README 22.20): the invitation is refused,
// and says so to those who manage the list, never why. Its link has
// acted: it opens nothing any more.
export default defineEventHandler(async (event) => {
  const { db, invite } = await invitationOfLink(event);
  if (!(await declineInvite(db, invite.id, nowIso()))) {
    throw createError({ statusCode: 410, statusMessage: 'invite_closed' });
  }
  return { ok: true };
});
