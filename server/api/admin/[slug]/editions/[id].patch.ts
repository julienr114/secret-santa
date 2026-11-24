import { eq } from 'drizzle-orm';
import { secretSantas } from '#server/database/schema';
import { findEdition, publicEdition } from '#server/database/editions';
import { recordEvent } from '#server/database/audit';
import { requireOpenYear } from '#server/database/years';
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
  await requireOpenYear(db, group.id, edition.yearId);
  if (edition.status === 'closed') {
    throw createError({ statusCode: 409, statusMessage: 'edition_closed' });
  }
  const { eventDate, rulesOverride, ...body } = await validatedBody(
    event,
    editionPatchSchema,
  );
  // The screen sends the edition's rules with one changed, and the day of
  // the party on its own: both go into the Secret Santa's rules.
  const rulesChanged = rulesOverride !== undefined || eventDate !== undefined;
  const before = unwrap(mergeRules(edition.rules));
  const after = unwrap(
    mergeRules(edition.rules, {
      ...((rulesOverride ?? {}) as object),
      ...(eventDate === undefined ? {} : { eventDate }),
    }),
  );
  const patch = rulesChanged ? { ...body, rules: after } : body;
  // « Devine qui » (README 22.17): the end of the guesses follows the
  // party, at the same time of day.
  const guessEndsAt =
    edition.guessEndsAt && before.eventDate && after.eventDate
      ? moveGuessEnd(edition.guessEndsAt, before.eventDate, after.eventDate)
      : edition.guessEndsAt;
  await db
    .update(secretSantas)
    .set({ ...patch, guessEndsAt })
    .where(eq(secretSantas.id, edition.id));
  if (rulesChanged) {
    await recordEvent(db, {
      type: 'rules_changed',
      groupId: group.id,
      editionId: edition.id,
      actor: user.role,
    });
  }
  return { edition: publicEdition({ ...edition, ...patch }) };
});
