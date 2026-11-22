import { and, eq, isNull } from 'drizzle-orm';
import { dbOf, type D1Binding } from '#server/database/client';
import { editionsToRemind, missingViewers } from '#server/database/notify';
import { secretSantas } from '#server/database/schema';
import { santaNameForSubject } from '#server/database/editions';
import { forgetNews } from '#server/database/news';
import { tellOrganisers } from '#server/database/newsEvents';
import { appUrl, nowIso } from '#server/http/context';
import { notifyOrganizers } from '#server/http/notify';
import { buildReminderEmail, isReminderDue } from '#server/utils/notifications';
import { SCHEDULED, dueBatch } from '#server/utils/limits';
import { mergeRules } from '#server/utils/rules';

// Every morning (cron in wrangler.toml): a few days before an exchange,
// the organisers learn who has not discovered their result yet. Each
// edition is reminded once; nobody missing, nothing is sent. A run
// handles a bounded number of editions and can be played again.
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
    // The news of more than thirty days are forgotten (ticket 120).
    await forgetNews(db, now).catch(() => undefined);
    // Bounded (lot 38 A): one run sends so many reminders; the others
    // wait for the next morning rather than make the run fail half-way.
    const due = dueBatch(
      (await editionsToRemind(db)).flatMap(({ edition, group }) => {
        const rules = mergeRules(edition.rules);
        return rules.ok ? [{ edition, group, rules: rules.value }] : [];
      }),
      ({ edition, rules }) =>
        isReminderDue(
          {
            status: edition.status,
            eventDate: rules.eventDate,
            reminderSentAt: edition.reminderSentAt,
          },
          today,
        ),
      SCHEDULED.remindersPerRun,
    );
    // One edition after the other: the free plan limits parallel requests.
    await due.reduce<Promise<void>>(
      (done, { edition, group, rules }) =>
        done.then(async () => {
          // Marked first, and only once: a run played again, or two at
          // the same time, never send the same reminder twice.
          const claimed = await db
            .update(secretSantas)
            .set({ reminderSentAt: now })
            .where(
              and(
                eq(secretSantas.id, edition.id),
                isNull(secretSantas.reminderSentAt),
              ),
            )
            .returning({ id: secretSantas.id });
          if (claimed.length === 0) return;
          const missing = await missingViewers(db, edition.id);
          // In the app always (ticket 120), by email if they want it.
          if (missing.length > 0) {
            await tellOrganisers(
              db,
              { partyId: group.id, kind: 'reminder', targetId: edition.id },
              now,
            );
          }
          if (!rules.notifyReminder || missing.length === 0) return;
          const santaName = await santaNameForSubject(db, edition);
          await notifyOrganizers({ db }, group.id, (locale) =>
            buildReminderEmail(
              {
                groupName: group.name,
                editionLabel: edition.label,
                eventDate: rules.eventDate,
                missing,
                santaName,
                link: appUrl(
                  undefined,
                  `/admin/${group.slug}/editions/${edition.id}`,
                ),
              },
              locale,
            ),
          );
        }),
      Promise.resolve(),
    );
  });
});
