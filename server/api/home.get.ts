import { findAccountById } from '#server/database/accounts';
import { useDb } from '#server/database/client';
import { loadHome } from '#server/database/homeParties';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';
import { settleArrivals } from '#server/http/lists';

// The home of the V3 (ticket 103): my parties, their Secret Santas and
// their lists, my people for « Bientôt ». Never a result of a draw.
// What waited for this account settles first (lists it was invited to hold,
// the people others gave its address for): the page « Listes » did it until
// ticket 114.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  await settleArrivals(db, account.id);
  return {
    firstName: account.firstName,
    ...(await loadHome(db, account, await dataKeyOf(event))),
  };
});
