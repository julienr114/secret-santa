import { and, eq, isNull } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { sessions } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { notFound } from '#server/http/errors';

// Logs one other device of the account out. Only a session of the same
// account can be closed; this device logs out with the menu.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const id = getRouterParam(event, 'id') ?? '';
  if (id === user.sessionId) {
    throw createError({ statusCode: 409, statusMessage: 'session_current' });
  }
  const closed = await useDb(event)
    .update(sessions)
    .set({ revokedAt: nowIso() })
    .where(
      and(
        eq(sessions.id, id),
        eq(sessions.accountId, user.accountId),
        isNull(sessions.revokedAt),
      ),
    )
    .returning({ id: sessions.id });
  if (closed.length === 0) throw notFound('session_not_found');
  return { ok: true };
});
