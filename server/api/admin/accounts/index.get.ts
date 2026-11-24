import { useDb } from '#server/database/client';
import { loadGroupOverviews } from '#server/database/overview';
import { appStats, listAdminAccounts } from '#server/database/quota';
import { isSwitchOn } from '#server/database/switches';
import { requireSuperAdmin } from '#server/http/auth';
import { appLoad } from '#server/utils/quota';

// The super-admin's view of the accounts (README 22.2): every account
// with its limit of Secret Santa, its groups (organised or taken part in,
// with their members and draw in progress), how loaded the app is, and
// the emergency switches.
export default defineEventHandler(async (event) => {
  const user = await requireSuperAdmin(event);
  const db = useDb(event);
  const [accounts, stats, overviews, paused] = await Promise.all([
    listAdminAccounts(db),
    appStats(db),
    loadGroupOverviews(db),
    isSwitchOn(db, 'new_secret_santas'),
  ]);
  return {
    accounts: accounts.map((account) => ({
      ...account,
      groups: account.groups.map((group) => ({
        ...group,
        ...(overviews[group.id] ?? { members: 0, draw: null }),
      })),
      me: account.id === user.accountId,
    })),
    stats: { ...stats, load: appLoad(stats.groups) },
    switches: { newSecretSantas: paused },
  };
});
