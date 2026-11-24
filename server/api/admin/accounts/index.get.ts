import { useDb } from '#server/database/client';
import { loadGroupOverviews } from '#server/database/overview';
import { appStats, listAdminAccounts } from '#server/database/quota';
import { isSwitchOn } from '#server/database/switches';
import { countersOf } from '#server/database/counters';
import { nowIso } from '#server/http/context';
import { EMAIL_CAPS, gaugeOf } from '#server/utils/spend';
import { requireSuperAdmin } from '#server/http/auth';
import { appLoad } from '#server/utils/quota';

// The super-admin's view of the accounts (README 22.2): every account
// with its limit of Secret Santa, its groups (organised or taken part in,
// with their members and draw in progress), how loaded the app is, the
// emergency switches, what to watch today and the caps (ticket 129).
export default defineEventHandler(async (event) => {
  const user = await requireSuperAdmin(event);
  const db = useDb(event);
  const day = nowIso().slice(0, 10);
  const [accounts, stats, overviews, paused, emails, signups, counters] =
    await Promise.all([
      listAdminAccounts(db),
      appStats(db),
      loadGroupOverviews(db),
      isSwitchOn(db, 'new_secret_santas'),
      isSwitchOn(db, 'emails'),
      isSwitchOn(db, 'signups'),
      countersOf(db, day),
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
    switches: { newSecretSantas: paused, emails, signups },
    // Ticket 129: what to watch today, and the caps of the emails.
    today: {
      rateLimited: counters.day.rate_limited ?? 0,
      loginFailed: counters.day.login_failed ?? 0,
      emailsRejected: counters.day.emails_rejected ?? 0,
      serverErrors: counters.day.server_error ?? 0,
    },
    caps: {
      emailsDay: gaugeOf(counters.day.emails_sent ?? 0, EMAIL_CAPS.day),
      emailsMonth: gaugeOf(counters.month.emails_sent ?? 0, EMAIL_CAPS.month),
    },
  };
});
