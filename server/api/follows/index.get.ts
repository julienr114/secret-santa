import { useDb } from '#server/database/client';
import { myFollowedLists } from '#server/database/follows';
import { requireAccount } from '#server/http/auth';

// The lists I follow (ticket 122), for « Me prévenir ».
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  return { lists: await myFollowedLists(useDb(event), user.accountId) };
});
