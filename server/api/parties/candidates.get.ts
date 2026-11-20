import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { partiesToTakeFrom } from '#server/database/parties';
import { requireAccount } from '#server/http/auth';

// « Reprendre les membres d'une autre fête » (ticket 104): the parties I
// organise and their people, their addresses included, which their
// organisers already see.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  return partiesToTakeFrom(db, account);
});
