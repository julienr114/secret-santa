import { participationHasHints } from '#server/database/hints';
import { z } from 'zod';
import { replaceWishes } from '#server/database/wishes';
import { announceHints } from '#server/http/hints';
import { requirePersonalLink } from '#server/http/personal';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canEditIdeas } from '#server/utils/hints';
import { normalizeWishes } from '#server/utils/wishes';
import { localeOf } from '#shared/i18n';

// Replaces the whole list of precise ideas (README 6 bis.3). Not journaled
// since the gift hints (README 22.11).
const bodySchema = z.object({ wishes: z.array(z.unknown()).max(200) });

export default defineEventHandler(async (event) => {
  const ctx = await requirePersonalLink(event);
  const { db, participation, edition, person, rules } = ctx;
  unwrap(canEditIdeas(edition.status, rules.giftHints));
  const body = await validatedBody(event, bodySchema);
  const list = unwrap(normalizeWishes(body.wishes, rules));
  const hadHints = await participationHasHints(db, participation.id);
  await replaceWishes(db, participation.id, list);
  await announceHints(event, ctx, hadHints);
  return {
    wishes: list.map(({ label, url }) => ({ label, url })),
    maxWishes: rules.maxWishes,
    editable: true,
    language: localeOf(person.language),
  };
});
