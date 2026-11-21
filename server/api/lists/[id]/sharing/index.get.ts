import { findAccountById } from '#server/database/accounts';
import { sharingOptions } from '#server/database/listSharing';
import { requireManagedList } from '#server/http/lists';

// « Qui verra ta liste ? » (docs/spec/v3/listes.md, ticket 106): the
// events I belong to and those it is shared in, each with its members,
// and whether it is public. For those who manage the list.
export default defineEventHandler(async (event) => {
  const { db, list, user } = await requireManagedList(event, 'share');
  const account = await findAccountById(db, user.accountId);
  if (!account) throw createError({ statusCode: 401 });
  return {
    options: await sharingOptions(db, list.id, account),
    isPublic: list.sharedAt !== null,
  };
});
