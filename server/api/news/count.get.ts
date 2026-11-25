import { useDb } from '#server/database/client';
import { countUnseen, pushedUnseen } from '#server/database/news';
import { requireAccount } from '#server/http/auth';

// The count on the tab « Quoi de neuf » (ticket 120): the news not seen;
// and those sent to the phones, whose notifications stay (ticket 175).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const [count, pushed] = await Promise.all([
    countUnseen(db, user.accountId),
    pushedUnseen(db, user.accountId),
  ]);
  return { count, pushed };
});
