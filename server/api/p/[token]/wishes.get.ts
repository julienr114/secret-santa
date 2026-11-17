import { listWishes } from '#server/database/wishes';
import { requirePersonalLink } from '#server/http/personal';
import { canEditIdeas } from '#server/utils/hints';
import { localeOf } from '#shared/i18n';

// The participant's own wish list (README 6 bis.3: the link is enough).
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, rules } =
    await requirePersonalLink(event);
  if (rules.giftHints !== 'full') {
    throw createError({ statusCode: 403, statusMessage: 'ideas_disabled' });
  }
  return {
    wishes: await listWishes(db, participation.id),
    maxWishes: rules.maxWishes,
    editable: canEditIdeas(edition.status, rules.giftHints).ok,
    language: localeOf(person.language),
  };
});
