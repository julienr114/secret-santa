import { count, eq } from 'drizzle-orm';
import { wishes } from '#server/database/schema';
import { findReceiverParticipationId } from '#server/database/draw';
import { dataKeyOf } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';
import { avatarOf } from '#server/utils/avatars';
import { localeOf } from '#shared/i18n';
import {
  canEditAvatar,
  canEditWishes,
  canReveal,
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
  // Once the participant has discovered their result, the page offers to
  // see it again and says how many ideas await them. Nothing here names
  // the receiver, and nothing is computed before the first reveal.
  const revealed = participation.viewCount > 0 && canReveal(edition.status).ok;
  const receiverParticipationId =
    revealed && rules.wishlist
      ? await findReceiverParticipationId(
          db,
          edition.id,
          person.id,
          await dataKeyOf(event),
        )
      : null;
  const [receiverRow] = receiverParticipationId
    ? await db
        .select({ n: count() })
        .from(wishes)
        .where(eq(wishes.participationId, receiverParticipationId))
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
    revealed,
    receiverWishesCount: receiverRow?.n ?? 0,
  };
});
