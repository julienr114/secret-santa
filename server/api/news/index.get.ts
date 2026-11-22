import { findAccountById } from '#server/database/accounts';
import { useDb } from '#server/database/client';
import { loadNewsPage } from '#server/database/newsPage';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';

// « Quoi de neuf » (ticket 120): my news by event. Reading it marks
// nothing as seen: only opening the thing does.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  return loadNewsPage(db, account, await dataKeyOf(event), nowIso());
});
