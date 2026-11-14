import { useDb } from '#server/database/client';
import { findAccountById, listActiveSessions } from '#server/database/accounts';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { deviceLabel } from '#server/utils/accounts';

// "My account": the address and the devices the account is logged in on.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  const rows = await listActiveSessions(db, user.accountId, nowIso());
  return {
    email: account?.email ?? '',
    isSuperAdmin: account?.isSuperAdmin ?? false,
    sessions: rows.map((row) => ({
      id: row.id,
      current: row.id === user.sessionId,
      device: deviceLabel(row.userAgent),
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
    })),
  };
});
