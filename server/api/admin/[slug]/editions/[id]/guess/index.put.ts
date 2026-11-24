import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import {
  secretSantas,
  partyOrganisers,
  guesses,
} from '#server/database/schema';
import { deleteGuessesOf, listGuesses } from '#server/database/guesses';
import { recordEvent } from '#server/database/audit';
import { forgetGameOpen, tellGameOpen } from '#server/database/newsEvents';
import { requireEdition } from '#server/http/edition';
import { newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { listParticipants } from '#server/database/editions';
import {
  GUESS_MODES,
  changeGuessMode,
  gamePossible,
} from '#server/utils/guesses';

// « Devine qui » (README 22.17, DevineReglage): the mode, and the end of
// the guesses on the day of the party, an instant chosen in the
// organiser's time zone. Going back to « Qui m'offre ? » keeps only the
// guesses on one's own Santa; turning the game off deletes them all (the
// screen asks first). Not once the draw is revealed or the edition closed,
// nor turned on after a draw of three (Correction 12): before the draw the
// setting stays free, the draw turns the game off.
const bodySchema = z.object({
  mode: z.enum(GUESS_MODES),
  endsAt: z.iso.datetime().optional(),
  timeZone: z.string().min(1).max(64).optional(),
  // Correction 15: the automatic reminder (the edition's), and « Me tenir
  // au courant » (the organiser's own, for this group).
  autoReminder: z.boolean().optional(),
  news: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (edition.status === 'closed' || edition.revealedAt) {
    throw createError({ statusCode: 409, statusMessage: 'invalid_transition' });
  }
  const { mode, endsAt, timeZone, autoReminder, news } = await validatedBody(
    event,
    bodySchema,
  );
  if (mode !== 'none' && (!endsAt || !timeZone)) {
    throw createError({ statusCode: 400, statusMessage: 'guess_needs_end' });
  }
  if (
    mode !== 'none' &&
    edition.status !== 'preparing' &&
    !gamePossible((await listParticipants(db, edition.id)).length)
  ) {
    throw createError({ statusCode: 409, statusMessage: 'game_needs_four' });
  }
  const { kept, lost } = changeGuessMode(
    mode,
    await listGuesses(db, edition.id),
  );
  const now = nowIso();
  await db.batch([
    db
      .update(secretSantas)
      .set({
        guessMode: mode,
        guessEndsAt: mode === 'none' ? null : endsAt,
        guessTimeZone: mode === 'none' ? null : timeZone,
        ...(autoReminder === undefined
          ? {}
          : { guessAutoReminder: autoReminder }),
        // When the game was turned on: a late game gets no automatic
        // reminder (README 22.17).
        ...(edition.guessMode === 'none' && mode !== 'none'
          ? { guessEnabledAt: now }
          : mode === 'none'
            ? { guessEnabledAt: null }
            : {}),
      })
      .where(eq(secretSantas.id, edition.id)),
    ...(lost > 0
      ? [
          deleteGuessesOf(db, [edition.id]),
          // One statement per guess: D1 caps the parameters of a statement.
          ...kept.map((g) =>
            db.insert(guesses).values({
              id: newId(),
              secretSantaId: edition.id,
              guesserPersonId: g.guesserId,
              recipientPersonId: g.recipientId,
              giverPersonId: g.giverId,
              updatedAt: now,
            }),
          ),
        ]
      : []),
    ...(news === undefined
      ? []
      : [
          db
            .update(partyOrganisers)
            .set({ guessNews: news })
            .where(
              and(
                eq(partyOrganisers.partyId, group.id),
                eq(partyOrganisers.accountId, user.accountId),
              ),
            ),
        ]),
  ]);
  if (edition.guessMode === 'none' && mode !== 'none') {
    await recordEvent(db, {
      type: 'guesses_enabled',
      groupId: group.id,
      editionId: edition.id,
      actor: user.role,
    });
    // Turned on after the draw: « À toi de jouer » (ticket 142).
    await tellGameOpen(
      db,
      { secretSantaId: edition.id, partyId: group.id },
      now,
    );
  }
  if (mode === 'none') await forgetGameOpen(db, edition.id);
  return { guessMode: mode, guessEndsAt: mode === 'none' ? null : endsAt };
});
