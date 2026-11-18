import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { guessesOf } from '#server/database/guesses';
import { nowIso } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { guessesOpen } from '#server/utils/guesses';
import { canSkip } from '#server/utils/nudges';

// « Je passe mon tour » and « Finalement, je joue » (README 22.17,
// Correction 15, DevinePasse): no more reminders, out of the counts and
// of the organiser's « pas encore joué » ; one comes back until the end.
// Not before playing is undone: a player has guesses. Not journaled.
const bodySchema = z.object({ skip: z.boolean() });

export default defineEventHandler(async (event) => {
  const { db, edition, person, participation } =
    await requirePersonalLink(event);
  const open = guessesOpen(edition, nowIso());
  if (!open) {
    throw createError({ statusCode: 409, statusMessage: 'guesses_closed' });
  }
  const { skip } = await validatedBody(event, bodySchema);
  if (skip) {
    const played = (await guessesOf(db, edition.id, person.id)).length > 0;
    if (!canSkip({ open, played })) {
      throw createError({ statusCode: 409, statusMessage: 'already_played' });
    }
  }
  await db
    .update(participations)
    .set({ guessSkippedAt: skip ? nowIso() : null })
    .where(eq(participations.id, participation.id));
  return { skipped: skip };
});
