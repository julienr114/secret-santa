import { findAccountById } from '#server/database/accounts';
import { useDb } from '#server/database/client';
import { elsewhereOf } from '#server/database/listSharing';
import { requireAccount } from '#server/http/auth';

// « Ce que j'offre ailleurs » (ticket 106): the public lists where I offer
// something without being a member of their events.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) throw createError({ statusCode: 401 });
  return { lists: await elsewhereOf(db, account) };
});
