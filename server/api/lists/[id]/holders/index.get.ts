import { holdersOfLists, invitesOfList } from '#server/database/lists';
import { holderView, requireHeldList } from '#server/http/lists';

// « Ceux qui tiennent la liste » (README 22.20, maquette ListeTeneurs):
// the accounts that hold it, all equal, and the invitations waiting.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  return {
    holders: holders.map((holder) => holderView(holder, user.accountId)),
    invites: (await invitesOfList(db, list.id)).map((invite) => ({
      id: invite.id,
      email: invite.email,
      createdAt: invite.createdAt,
    })),
  };
});
