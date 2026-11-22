import { markResultsSeen } from '#server/database/guesses';
import { markSeenByEmail } from '#server/database/news';
import { nowIso } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';

// The participant watched the palmarès (README 22.17): « Revoir le
// palmarès », their guesses corrected, and no more card on the home.
export default defineEventHandler(async (event) => {
  const link = await requirePersonalLink(event, { afterTheYear: true });
  const { db, edition, participation, person } = link;
  if (!edition.revealedAt && edition.status !== 'closed') {
    throw createError({
      statusCode: 409,
      statusMessage: 'results_not_revealed',
    });
  }
  if (!participation.guessResultsSeenAt) {
    await markResultsSeen(db, participation.id, nowIso());
  }
  // The news of the palmarès are seen with it (ticket 120).
  await markSeenByEmail(db, person.email, 'game', edition.id, nowIso());
  return { ok: true };
});
