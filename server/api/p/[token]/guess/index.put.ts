import { z } from 'zod';
import { editionPersons } from '#server/database/answers';
import { guessesOf, replaceGuessesOf } from '#server/database/guesses';
import { newId, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import {
  guessChoices,
  guessesOpen,
  placeGuess,
  type GuessMode,
} from '#server/utils/guesses';

// A guess, made, changed or taken back (`giverId: null`), until the end of
// the guesses (README 22.17). The player comes from the link. Naming a
// person already named for someone else moves the guess. Not journaled:
// a guess is nobody's business before the party.
const bodySchema = z.object({
  recipientId: z.string().min(1),
  giverId: z.string().min(1).nullable(),
});

export default defineEventHandler(async (event) => {
  const { db, edition, person } = await requirePersonalLink(event);
  if (!guessesOpen(edition, nowIso())) {
    throw createError({ statusCode: 409, statusMessage: 'guesses_closed' });
  }
  const { recipientId, giverId } = await validatedBody(event, bodySchema);
  const choices = unwrap(
    guessChoices({
      mode: edition.guessMode as GuessMode,
      playerId: person.id,
      recipientId,
      participantIds: (await editionPersons(db, edition.id)).map((p) => p.id),
    }),
  );
  if (giverId !== null && !choices.includes(giverId)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_guess' });
  }
  const before = await guessesOf(db, edition.id, person.id);
  const mine =
    giverId === null
      ? before.filter((g) => g.recipientId !== recipientId)
      : placeGuess(before, {
          guesserId: person.id,
          recipientId,
          giverId,
          at: nowIso(),
        });
  await db.batch(
    replaceGuessesOf(db, edition.id, person.id, mine, {
      newId,
      now: nowIso(),
    }),
  );
  return {
    mine: mine.map((g) => ({ recipientId: g.recipientId, giverId: g.giverId })),
  };
});
