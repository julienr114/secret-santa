import { and, eq, isNull } from 'drizzle-orm';
import { dbOf, type D1Binding } from '#server/database/client';
import { gamesToWatch } from '#server/database/guesses';
import { editions, groups } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { nowIso, secretsOf } from '#server/http/context';
import { afterReveal, closeGuesses } from '#server/http/guesses';
import { importDataKey } from '#server/utils/crypto';
import { autoRevealDue } from '#server/utils/guesses';

// « Devine qui » (README 22.17), every 15 minutes (cron in wrangler.toml): the
// guesses close at the end time, written in the journal; if the organiser
// has not revealed the draw by the day after the party at that time, it
// is revealed automatically, as an action of the system, and the results
// come.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', async ({ env }) => {
    const d1 = (env as { DB?: D1Binding }).DB;
    if (!d1) return;
    const db = dbOf(d1);
    const key = await importDataKey(secretsOf().dataKey);
    if (!key.ok) return;
    const now = nowIso();
    const rows = await gamesToWatch(db);
    // One edition after the other: the free plan limits parallel requests.
    await rows.reduce<Promise<void>>(
      (done, edition) =>
        done.then(async () => {
          if (edition.guessEndsAt && now >= edition.guessEndsAt) {
            await closeGuesses({ db }, edition, edition.groupId, 'system');
          }
          if (!autoRevealDue(edition, now)) return;
          const [group] = await db
            .select()
            .from(groups)
            .where(eq(groups.id, edition.groupId))
            .limit(1);
          if (!group) return;
          const revealed = await db
            .update(editions)
            .set({ revealedAt: now })
            .where(
              and(eq(editions.id, edition.id), isNull(editions.revealedAt)),
            )
            .returning({ id: editions.id });
          if (revealed.length === 0) return;
          await recordEvent(db, {
            type: 'draw_revealed',
            groupId: group.id,
            editionId: edition.id,
            actor: 'system',
          });
          await afterReveal(
            { db, dataKey: key.value },
            { ...edition, revealedAt: now },
            group,
            'system',
          );
        }),
      Promise.resolve(),
    );
  });
});
