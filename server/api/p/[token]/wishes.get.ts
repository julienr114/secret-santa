import { listWishes } from '#server/database/wishes';
import { requirePersonalLink } from '#server/http/personal';
import { canEditWishes } from '#server/utils/personal';
import { localeOf } from '#shared/i18n';

// The participant's own wish list (README 6 bis.3: the link is enough).
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, rules } =
    await requirePersonalLink(event);
  if (!rules.wishlist) {
    throw createError({ statusCode: 403, statusMessage: 'wishlist_disabled' });
  }
  return {
    wishes: await listWishes(db, participation.id),
    maxWishes: rules.maxWishes,
    editable: canEditWishes(edition.status, rules).ok,
    language: localeOf(person.language),
  };
});
