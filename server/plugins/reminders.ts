import { eq } from 'drizzle-orm';
import { dbOf, type D1Binding } from '#server/database/client';
import { editionsToRemind, missingViewers } from '#server/database/notify';
import { editions } from '#server/database/schema';
import { appUrl, nowIso } from '#server/http/context';
import { notifyOrganizers } from '#server/http/notify';
import { buildReminderEmail, isReminderDue } from '#server/utils/notifications';
import { mergeRules } from '#server/utils/rules';

// Every morning (cron in wrangler.toml): a few days before an exchange,
// the organisers learn who has not discovered their result yet. Each
// edition is reminded once; nobody missing, nothing is sent.
/** The schedule of wrangler.toml every 15 minutes, left to the game. */
const GAME_CRON = '*/15 * * * *';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', async ({ env, controller }) => {
    // That run is for « Devine qui » only (server/plugins/guesses.ts).
    if (controller?.cron === GAME_CRON) return;
    const d1 = (env as { DB?: D1Binding }).DB;
    if (!d1) return;
    const db = dbOf(d1);
    const now = nowIso();
    const today = now.slice(0, 10);
    const rows = await editionsToRemind(db);
    // One edition after the other: the free plan limits parallel requests.
    await rows.reduce<Promise<void>>(
      (done, { edition, group }) =>
        done.then(async () => {
          const rules = mergeRules(group.rules, edition.rulesOverride);
          if (!rules.ok) return;
          const due = isReminderDue(
            {
              status: edition.status,
              eventDate: rules.value.eventDate,
              reminderSentAt: edition.reminderSentAt,
            },
            today,
          );
          if (!due) return;
          const missing = await missingViewers(db, edition.id);
          if (rules.value.notifyReminder && missing.length > 0) {
            await notifyOrganizers({ db }, group.id, (locale) =>
              buildReminderEmail(
                {
                  groupName: group.name,
                  editionLabel: edition.label,
                  eventDate: rules.value.eventDate,
                  missing,
                  link: appUrl(
                    undefined,
                    `/admin/${group.slug}/editions/${edition.id}`,
                  ),
                },
                locale,
              ),
            );
          }
          await db
            .update(editions)
            .set({ reminderSentAt: now })
            .where(eq(editions.id, edition.id));
        }),
      Promise.resolve(),
    );
  });
});
