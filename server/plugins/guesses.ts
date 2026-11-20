import { and, eq, isNull } from 'drizzle-orm';
import { dbOf, type D1Binding } from '#server/database/client';
import { gamesToWatch } from '#server/database/guesses';
import { secretSantas, parties } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { nowIso, secretsOf } from '#server/http/context';
import { afterReveal, closeGuesses } from '#server/http/guesses';
import { autoRemind, organizerEnd, organizerPoint } from '#server/http/nudges';
import { importDataKey } from '#server/utils/crypto';
import { autoRevealDue } from '#server/utils/guesses';

// « Devine qui » (README 22.17), every 15 minutes (cron in wrangler.toml): the
// guesses close at the end time, written in the journal, and the
// organisers are told; if the organiser has not revealed the draw by the
// day after the party at that time, it is revealed automatically, as an
// action of the system, and the results come. Before the end, the
// organisers' point five days before and the automatic reminder two days
// before (Correction 15).
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
          const [group] = await db
            .select()
            .from(parties)
            .where(eq(parties.id, edition.partyId))
            .limit(1);
          if (!group) return;
          const ctx = { db, dataKey: key.value };
          if (edition.guessEndsAt && now >= edition.guessEndsAt) {
            await closeGuesses({ db }, edition, edition.partyId, 'system');
            await organizerEnd(ctx, edition, group);
          } else {
            await organizerPoint(ctx, edition, group, now);
            await autoRemind(ctx, edition, group, now);
          }
          if (!autoRevealDue(edition, now)) return;
          const revealed = await db
            .update(secretSantas)
            .set({ revealedAt: now })
            .where(
              and(
                eq(secretSantas.id, edition.id),
                isNull(secretSantas.revealedAt),
              ),
            )
            .returning({ id: secretSantas.id });
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
