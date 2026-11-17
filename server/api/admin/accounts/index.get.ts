import { useDb } from '#server/database/client';
import { loadGroupOverviews } from '#server/database/overview';
import {
  appStats,
  listAdminAccounts,
  listPendingRequests,
} from '#server/database/quota';
import { requireSuperAdmin } from '#server/http/auth';
import { appLoad } from '#server/utils/quota';

// The super-admin's view of the accounts (README 22.2): every account
// with its quota, its groups (organised or taken part in, with their
// members and draw in progress) and whether its last request was
// refused, the requests awaiting a decision, and how loaded the app is,
// to weigh each new group.
export default defineEventHandler(async (event) => {
  const user = await requireSuperAdmin(event);
  const db = useDb(event);
  const [requests, accounts, stats, overviews] = await Promise.all([
    listPendingRequests(db),
    listAdminAccounts(db),
    appStats(db),
    loadGroupOverviews(db),
  ]);
  return {
    requests,
    accounts: accounts.map((account) => ({
      ...account,
      groups: account.groups.map((group) => ({
        ...group,
        ...(overviews[group.id] ?? { members: 0, draw: null }),
      })),
      me: account.id === user.accountId,
    })),
    stats: { ...stats, load: appLoad(stats.groups) },
  };
});
