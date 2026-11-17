import { eq } from 'drizzle-orm';
import { editions } from '#server/database/schema';
import { findEdition, publicEdition } from '#server/database/editions';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { editionPatchSchema } from '#server/utils/editions';
import { mergeRules } from '#server/utils/rules';
import { moveGuessEnd } from '#server/utils/guesses';

// Label, rule overrides and the day of the party. Status changes have
// their own routes.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const edition = await findEdition(db, group.id, getRouterParam(event, 'id'));
  if (!edition) throw notFound('edition_not_found');
  if (edition.status === 'closed') {
    throw createError({ statusCode: 409, statusMessage: 'edition_closed' });
  }
  const { eventDate, ...body } = await validatedBody(event, editionPatchSchema);
  // The day of the party is kept with the edition's own rules.
  const patch =
    eventDate === undefined
      ? body
      : {
          ...body,
          rulesOverride: {
            ...((body.rulesOverride ?? edition.rulesOverride ?? {}) as object),
            eventDate,
          },
        };
  const before = unwrap(mergeRules(group.rules, edition.rulesOverride));
  const after = unwrap(
    mergeRules(group.rules, patch.rulesOverride ?? edition.rulesOverride),
  );
  // « Devine qui » (README 22.17): the end of the guesses follows the
  // party, at the same time of day.
  const guessEndsAt =
    edition.guessEndsAt && before.eventDate && after.eventDate
      ? moveGuessEnd(edition.guessEndsAt, before.eventDate, after.eventDate)
      : edition.guessEndsAt;
  await db
    .update(editions)
    .set({ ...patch, guessEndsAt })
    .where(eq(editions.id, edition.id));
  if (patch.rulesOverride !== undefined) {
    await recordEvent(db, {
      type: 'rules_changed',
      groupId: group.id,
      editionId: edition.id,
      actor: user.role,
    });
  }
  return { edition: publicEdition({ ...edition, ...patch }) };
});
