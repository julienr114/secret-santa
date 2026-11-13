import { count, eq } from 'drizzle-orm';
import { wishes } from '#server/database/schema';
import { requirePersonalLink } from '#server/http/personal';
import { avatarOf } from '#server/utils/avatars';
import { localeOf } from '#shared/i18n';
import {
  canEditAvatar,
  canEditWishes,
  personalPhase,
} from '#server/utils/personal';

// State of a participation for the personal page (README 4.3). Never the
// result, and never counted as a consultation: link previews call this.
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group, rules } =
    await requirePersonalLink(event);
  const [row] = rules.wishlist
    ? await db
        .select({ n: count() })
        .from(wishes)
        .where(eq(wishes.participationId, participation.id))
    : [];
  return {
    firstName: person.firstName,
    language: localeOf(person.language),
    avatar: avatarOf(person),
    avatarEditable: canEditAvatar(edition.status).ok,
    groupName: group.name,
    editionLabel: edition.label,
    status: edition.status,
    phase: personalPhase(edition.status),
    wishlist: rules.wishlist,
    wishesEditable: canEditWishes(edition.status, rules).ok,
    wishesCount: row?.n ?? 0,
  };
});
