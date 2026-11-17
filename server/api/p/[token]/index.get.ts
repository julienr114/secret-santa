import { and, count, eq, gt, inArray } from 'drizzle-orm';
import { auditLog, wishes } from '#server/database/schema';
import { findReceiverParticipationId } from '#server/database/draw';
import { dataKeyOf } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';
import { optionalAccount } from '#server/http/auth';
import { findAccountById } from '#server/database/accounts';
import { avatarOf } from '#server/utils/avatars';
import { unseenAlerts } from '#server/utils/audit';
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
  // For the invitation to keep the draw in an account: is this draw
  // already in the logged-in account, can it be added, or is it someone
  // else's? Null without an account.
  const user = await optionalAccount(event);
  const account = user ? await findAccountById(db, user.accountId) : null;
  const linked = !account
    ? null
    : person.email === account.email
      ? 'mine'
      : person.email
        ? 'other'
        : 'free';
  // Alerts of the journal since the participant last opened it from
  // here; never opened, since the draw.
  const since =
    participation.journalSeenAt ?? edition.drawnAt ?? edition.createdAt;
  const alertRows = await db
    .select({
      type: auditLog.type,
      personId: auditLog.personId,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.groupId, group.id),
        gt(auditLog.createdAt, since),
        inArray(auditLog.type, [
          'result_revealed',
          'results_revealed',
          'link_regenerated',
        ]),
      ),
    );
  return {
    linked,
    // Their own address, if the organiser gave one: to create an account
    // without typing it.
    email: linked === null ? (person.email ?? null) : null,
    firstName: person.firstName,
    language: localeOf(person.language),
    avatar: avatarOf(person),
    avatarEditable: canEditAvatar(edition.status).ok,
    groupName: group.name,
    editionLabel: edition.label,
    status: edition.status,
    phase: personalPhase(edition.status),
    // The day of the party is no secret: the messages give it to all.
    eventDate: rules.eventDate,
    wishlist: rules.wishlist,
    wishesEditable: canEditWishes(edition.status, rules).ok,
    wishesCount: row?.n ?? 0,
    revealed,
    receiverWishesCount: receiverRow?.n ?? 0,
    journalAlerts: unseenAlerts(alertRows, person.id, since),
  };
});
