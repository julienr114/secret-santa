import { dbOf, type D1Binding } from '#server/database/client';
import { sendNewsEmails } from '#server/database/newsMail';
import { appUrl, nowIso, secretsOf } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { importDataKey } from '#server/utils/crypto';

// The emails of the news (ticket 121), at every run of the scheduled task
// (every quarter of an hour, and the morning one): what presses, and
// everything for « Tout de suite », within the quarter of an hour; the
// summary from the morning on. Nothing without an email key: the news
// wait, unsent, in « Quoi de neuf ».
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', async ({ env }) => {
    const d1 = (env as { DB?: D1Binding }).DB;
    if (!d1 || !secretsOf().resendApiKey) return;
    const key = await importDataKey(secretsOf().dataKey);
    if (!key.ok) return;
    const db = dbOf(d1);
    await sendNewsEmails(db, {
      dataKey: key.value,
      now: nowIso(),
      url: (path) => appUrl(undefined, path),
      send: (emails) => sendEmails(undefined, emails, { db }),
    }).catch(() => 0);
  });
});
