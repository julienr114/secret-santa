import { dbOf, type D1Binding } from '#server/database/client';
import { sendNewsEmails } from '#server/database/newsMail';
import { sendNewsPushes } from '#server/database/push';
import { appUrl, nowIso, secretsOf } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { importDataKey } from '#server/utils/crypto';

// The news outside the app, at every run of the scheduled task (every
// quarter of an hour, and the morning one): what presses to the phones
// that asked for it (ticket 124), then the emails (ticket 121), what
// presses and everything for « Tout de suite » within the quarter of an
// hour, the summary from the morning on. Nothing without the keys: the
// news wait, unsent, in « Quoi de neuf ».
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', async ({ env }) => {
    const d1 = (env as { DB?: D1Binding }).DB;
    if (!d1) return;
    const key = await importDataKey(secretsOf().dataKey);
    if (!key.ok) return;
    const db = dbOf(d1);
    const now = nowIso();
    const secrets = secretsOf();
    // The phones first (ticket 124): the emails of what presses wait ten
    // minutes after them.
    if (secrets.vapidPublicKey && secrets.vapidPrivateKey) {
      await sendNewsPushes(db, {
        dataKey: key.value,
        now,
        vapid: {
          publicKey: secrets.vapidPublicKey,
          privateKey: secrets.vapidPrivateKey,
          subject: appUrl(undefined, '/'),
        },
        post: async (endpoint, headers, body) =>
          (await fetch(endpoint, { method: 'POST', headers, body })).status,
      }).catch(() => 0);
    }
    if (!secrets.resendApiKey) return;
    await sendNewsEmails(db, {
      dataKey: key.value,
      now,
      url: (path) => appUrl(undefined, path),
      send: (emails) => sendEmails(undefined, emails, { db }),
    }).catch(() => 0);
  });
});
