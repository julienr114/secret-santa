import { markResultsSeen } from '#server/database/guesses';
import { nowIso } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';

// The participant watched the palmarès (README 22.17): « Revoir le
// palmarès », their guesses corrected, and no more card on the home.
export default defineEventHandler(async (event) => {
  const { db, edition, participation } = await requirePersonalLink(event);
  if (!edition.revealedAt && edition.status !== 'closed') {
    throw createError({
      statusCode: 409,
      statusMessage: 'results_not_revealed',
    });
  }
  if (!participation.guessResultsSeenAt) {
    await markResultsSeen(db, participation.id, nowIso());
  }
  return { ok: true };
});
