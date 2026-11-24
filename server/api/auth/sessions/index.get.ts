import { useDb } from '#server/database/client';
import { findAccountById, listActiveSessions } from '#server/database/accounts';
import { requireAccount } from '#server/http/auth';
import { blockedAddresses } from '#server/http/emailStatus';
import { nowIso } from '#server/http/context';
import { deviceLabel } from '#server/utils/accounts';
import { avatarOf } from '#server/utils/avatars';
import { localeOf } from '#shared/i18n';

// "My account": the address, the profile and the devices the account is
// logged in on.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  const rows = await listActiveSessions(db, user.accountId, nowIso());
  return {
    email: account?.email ?? '',
    firstName: account?.firstName ?? null,
    lastName: account?.lastName ?? null,
    language: localeOf(account?.language),
    avatar: avatarOf({ id: user.accountId, ...account }),
    isSuperAdmin: account?.isSuperAdmin ?? false,
    // « Me prévenir », « Par email » (ticket 121).
    emailNews: account?.emailNews ?? 'summary',
    // « Ne plus recevoir d'emails », asked by the link (ticket 130).
    emailBlocked: account
      ? (await blockedAddresses(event, db, [account.email])).size > 0
      : false,
    sessions: rows.map((row) => ({
      id: row.id,
      current: row.id === user.sessionId,
      device: deviceLabel(row.userAgent),
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
    })),
  };
});
