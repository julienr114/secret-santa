import { findAccountById } from '#server/database/accounts';
import { useDb } from '#server/database/client';
import { loadHome } from '#server/database/homeParties';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';

// The home of the V3 (ticket 103): my parties, their Secret Santas and
// their lists, my people for « Bientôt ». Never a result of a draw.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return {
    firstName: account.firstName,
    ...(await loadHome(db, account, await dataKeyOf(event))),
  };
});
