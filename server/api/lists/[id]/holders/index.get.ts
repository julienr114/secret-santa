import {
  familyOf,
  forgetInvites,
  holdersOfLists,
  invitesOfList,
} from '#server/database/lists';
import { nowIso } from '#server/http/context';
import { holderView, requireHeldList } from '#server/http/lists';
import {
  holderMay,
  inviteForgotten,
  inviteState,
} from '#server/utils/listAccess';

// « Ceux qui tiennent la liste » (README 22.20, lot 25 bis, maquette
// ListeTeneurs): the accounts that hold it, each with their level; the
// invitations, waiting, expired or refused (the lines that ended 30 days
// ago go as the page is read); and, for those who manage the list, my
// people linked to an account, to invite by a pill. Someone invited is
// named as I named them among my people, otherwise by their address.
export default defineEventHandler(async (event) => {
  const { db, user, list, level } = await requireHeldList(event);
  const now = nowIso();
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const all = await invitesOfList(db, list.id);
  await forgetInvites(
    db,
    all.filter((invite) => inviteForgotten(invite, now)).map((i) => i.id),
  );
  const invites = all.filter(
    (invite) =>
      !inviteForgotten(invite, now) && inviteState(invite, now) !== 'accepted',
  );
  const mine = (await familyOf(db, user.accountId)).filter(
    (member) => !member.isSelf,
  );
  const manages = holderMay(level, 'invite');
  const taken = new Set([
    ...holders.map((holder) => holder.email),
    ...invites
      .filter((invite) => inviteState(invite, now) === 'waiting')
      .map((invite) => invite.email),
  ]);
  const holding = new Set(holders.map((holder) => holder.accountId));
  return {
    manages,
    holders: holders.map((holder) => holderView(holder, user.accountId)),
    invites: invites.map((invite) => {
      const known = mine.find((member) => member.email === invite.email);
      return {
        id: invite.id,
        email: invite.email,
        name: known?.firstName ?? null,
        avatar: known?.avatar ?? null,
        level: invite.level,
        state: inviteState(invite, now) as 'waiting' | 'expired' | 'declined',
        sentAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        declinedAt: invite.declinedAt,
      };
    }),
    suggestions: manages
      ? mine
          .filter(
            (member) =>
              member.accountId !== null &&
              !holding.has(member.accountId) &&
              !(member.email && taken.has(member.email)),
          )
          .map((member) => ({
            memberId: member.id,
            name: member.firstName,
            avatar: member.avatar,
          }))
      : [],
  };
});
