import { findAccountByEmail } from '#server/database/accounts';
import { nowIso } from '#server/http/context';
import { invitationOfLink } from '#server/http/invitation';
import { avatarOf } from '#server/utils/avatars';
import { inviteState } from '#server/utils/listAccess';

// What the page of an invitation shows (lot 25 bis, maquettes
// ListeInvitation, ListeInvitationCompte): who invites, to which list,
// at which level, and where the invitation stands. Still waiting, it
// also says whose it is: the icon and first name of the account at that
// address, or the address a new account would be created at. Reading
// changes nothing.
export default defineEventHandler(async (event) => {
  const { db, invite, list, by } = await invitationOfLink(event);
  const state = inviteState(invite, nowIso());
  const head = {
    state,
    by: by.firstName ?? by.email.split('@')[0] ?? '',
    title: list.title,
    level: invite.level,
    expiresAt: invite.expiresAt,
  };
  setResponseHeader(event, 'Cache-Control', 'no-store');
  if (state === 'accepted') return { ...head, listId: list.id };
  if (state !== 'waiting') return head;
  const account = await findAccountByEmail(db, invite.email);
  return {
    ...head,
    email: invite.email,
    account: account
      ? {
          name: account.firstName ?? account.email.split('@')[0] ?? '',
          avatar: avatarOf(account),
        }
      : null,
  };
});
