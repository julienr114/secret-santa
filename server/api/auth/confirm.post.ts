import { z } from 'zod';
import { useDb } from '#server/database/client';
import { findLoginLink, openSession } from '#server/database/accounts';
import { countUp } from '#server/database/counters';
import { organizedGroupCount } from '#server/database/groups';
import { nowIso } from '#server/http/context';
import { usableLink } from '#server/utils/accounts';
import { roleOf } from '#server/utils/auth';
import { hashToken } from '#server/utils/crypto';

// The "Se connecter" button of a login link (README 22.5). The link is
// consumed here, by an explicit gesture, never by opening its page: mail
// scanners and link previews do not burn it. Unknown, used or expired
// links all get the same refusal.
const bodySchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });

export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const now = nowIso();
  // A failed login is counted for the dashboard (ticket 129).
  const refuse = async () => {
    await countUp(db, 'login_failed', now.slice(0, 10));
    return createError({
      statusCode: 410,
      statusMessage: 'login_link_invalid',
    });
  };
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null));
  if (!parsed.success) throw await refuse();
  const row = await findLoginLink(db, await hashToken(parsed.data.token));
  if (!row || !usableLink(row.link, now).ok || row.account.disabledAt) {
    throw await refuse();
  }
  const role = roleOf({
    isSuperAdmin: row.account.isSuperAdmin,
    groupCount: await organizedGroupCount(db, row.account.id),
  });
  const sessionId = await openSession(db, {
    linkId: row.link.id,
    accountId: row.account.id,
    userAgent: getRequestHeader(event, 'user-agent') ?? null,
    now,
  });
  if (!sessionId) throw await refuse();
  const user = { role, accountId: row.account.id, sessionId };
  await setUserSession(event, { user, loggedInAt: now });
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return { user };
});
