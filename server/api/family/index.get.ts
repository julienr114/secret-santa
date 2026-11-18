import { useDb } from '#server/database/client';
import { familyOf } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';

// The people of my family, kept from one list to the next (README 22.19).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  return { members: await familyOf(useDb(event), user.accountId) };
});
