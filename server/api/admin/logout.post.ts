import { useDb } from '#server/database/client';
import { revokeSession } from '#server/database/accounts';
import { nowIso } from '#server/http/context';

// Logging out also revokes the session row of an account, so that a copy
// of the cookie stops working.
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const sessionId = session?.user?.sessionId;
  if (sessionId) await revokeSession(useDb(event), sessionId, nowIso());
  await clearUserSession(event);
  return { ok: true };
});
