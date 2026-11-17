import {
  findPortrait,
  findPreviousHints,
  participationHasHints,
  savePortrait,
} from '#server/database/hints';
import { listWishes, replaceWishes } from '#server/database/wishes';
import { requirePersonalLink } from '#server/http/personal';
import { hintsPayload, announceHints } from '#server/http/hints';
import { notFound, unwrap } from '#server/http/errors';
import { canEditHints } from '#server/utils/hints';

// « Reprendre mes pistes de {édition précédente} » (README 22.11): only on
// an empty page, from the latest earlier edition of the group with hints.
export default defineEventHandler(async (event) => {
  const ctx = await requirePersonalLink(event);
  const { db, participation, edition, person, group, rules } = ctx;
  unwrap(canEditHints(edition.status, rules.giftHints));
  if (await participationHasHints(db, participation.id)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'hints_already_given',
    });
  }
  const previous = await findPreviousHints(db, {
    personId: person.id,
    groupId: group.id,
    editionCreatedAt: edition.createdAt,
  });
  if (!previous) throw notFound('no_previous_hints');
  await savePortrait(
    db,
    participation.id,
    await findPortrait(db, previous.participationId),
  );
  if (rules.giftHints === 'full') {
    const ideas = await listWishes(db, previous.participationId);
    await replaceWishes(
      db,
      participation.id,
      ideas
        .slice(0, rules.maxWishes)
        .map((idea, position) => ({ ...idea, position })),
    );
  }
  await announceHints(event, ctx, false);
  return hintsPayload(ctx);
});
