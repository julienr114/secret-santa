import { useDb } from '#server/database/client';
import { countUnseen } from '#server/database/news';
import { requireAccount } from '#server/http/auth';

// The count on the tab « Quoi de neuf » (ticket 120): the news not seen.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  return {
    count: await countUnseen(useDb(event), user.accountId),
  };
});
