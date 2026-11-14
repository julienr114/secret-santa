import { useDb } from '#server/database/client';
import { revokeAllSessions } from '#server/database/accounts';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';

// "Déconnecter partout": closes every session of the account, this one
// included.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  await revokeAllSessions(useDb(event), user.accountId, nowIso());
  await clearUserSession(event);
  return { ok: true };
});
