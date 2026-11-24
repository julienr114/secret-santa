import { readPairs } from '#server/database/draw';
import { listGuesses } from '#server/database/guesses';
import { editionPersons } from '#server/database/answers';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { avatarOf } from '#server/utils/avatars';
import {
  guessesEndedAt,
  palmares,
  type GuessMode,
} from '#server/utils/guesses';
import { byName, displayName } from '#server/utils/people';

// The palmarès of « Devine qui » for the organiser (README 22.17), even
// one who does not take part: once the draw is revealed or the edition
// closed only, without « mon Père Noël ».
export default defineEventHandler(async (event) => {
  const { db, edition, group } = await requireEdition(event);
  if (edition.guessMode === 'none') {
    throw createError({ statusCode: 409, statusMessage: 'guesses_off' });
  }
  if (!edition.revealedAt && edition.status !== 'closed') {
    throw createError({
      statusCode: 409,
      statusMessage: 'results_not_revealed',
    });
  }
  const [rows, guesses, pairs] = await Promise.all([
    editionPersons(db, edition.id),
    listGuesses(db, edition.id),
    readPairs(db, edition.id, await dataKeyOf(event)),
  ]);
  const result = palmares(
    guesses,
    pairs,
    edition.guessMode as GuessMode,
    guessesEndedAt(edition),
  );
  return {
    editionLabel: edition.label,
    // « Père Noël » is only said in a Christmas party (vocabulaire.md).
    christmas: group.category === 'christmas',
    // « C'est tout pour cette année » only in a party that comes back.
    recurring: group.recurring,
    people: rows.toSorted(byName).map((p) => ({
      id: p.id,
      name: displayName(p, rows),
      avatar: avatarOf(p),
    })),
    ...result,
    unmasked: result.awards.find((a) => a.kind === 'unmasked')?.count ?? 0,
  };
});
