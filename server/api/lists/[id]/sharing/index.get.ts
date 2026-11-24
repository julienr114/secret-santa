import { findAccountById } from '#server/database/accounts';
import { amOnList } from '#server/database/drawLists';
import { sharingOptions } from '#server/database/listSharing';
import { ownEventOf } from '#server/database/listMembers';
import { requireManagedList } from '#server/http/lists';
import { canInviteToList } from '#shared/utils/members';

// « Qui voit ta liste ? » (docs/spec/v3/listes.md, ticket 139): the
// events I belong to and those it is shared in, each with its members and
// whether « Celui qui m'a tiré » is there; whether it is public; whether
// I am on it (« Celui qui m'a tiré » is offered only then); whether
// « Quelqu'un d'autre » is offered: it is shared with all the members of
// its own event (ticket 117). For those who manage the list.
export default defineEventHandler(async (event) => {
  const { db, list, user } = await requireManagedList(event, 'share');
  const account = await findAccountById(db, user.accountId);
  if (!account) throw createError({ statusCode: 401 });
  return {
    options: await sharingOptions(db, list.id, account),
    isPublic: list.sharedAt !== null,
    onList: await amOnList(db, list.id, account.id),
    invite: canInviteToList({
      manages: true,
      ownStage: (await ownEventOf(db, list))?.stage ?? null,
    }),
  };
});
