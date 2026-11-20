import { and, eq, gt, inArray } from 'drizzle-orm';
import { auditLog } from '#server/database/schema';
import {
  findHintRequest,
  participationHasHints,
  receiverHintsOf,
} from '#server/database/hints';
import { dataKeyOf } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';
import { optionalAccount } from '#server/http/auth';
import { findAccountById } from '#server/database/accounts';
import { avatarOf } from '#server/utils/avatars';
import { ALERT_TYPES, unseenAlerts } from '#server/utils/audit';
import { localeOf } from '#shared/i18n';
import {
  canEditAvatar,
  canReveal,
  personalPhase,
} from '#server/utils/personal';
import { canEditHints, canRequestHints } from '#server/utils/hints';
import { editionPersons, findAnswers } from '#server/database/answers';
import { answersState } from '#server/utils/answers';
import { gamePayload } from '#server/http/guesses';
import { organizerCount } from '#server/database/groups';

// State of a participation for the personal page (README 4.3). Never the
// result, and never counted as a consultation: link previews call this.
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group, rules, ...rest } =
    await requirePersonalLink(event);
  const hintsOn = rules.giftHints !== 'none';
  // Once drawn, the page says whether the person they give to left hints,
  // and whether they are new since the result was last opened (lot 16
  // bis); never who it is.
  const revealed = participation.viewCount > 0 && canReveal(edition.status).ok;
  const receiver =
    hintsOn && canReveal(edition.status).ok
      ? await receiverHintsOf(
          db,
          {
            editionId: edition.id,
            personId: person.id,
            lastViewedAt: participation.lastViewedAt,
          },
          await dataKeyOf(event),
        )
      : null;
  const request = receiver?.receiverParticipationId
    ? await findHintRequest(db, receiver.receiverParticipationId)
    : null;
  // A draw made elsewhere (README 22.12): whether they answered, and how
  // many did; never what anyone answered.
  const collecting =
    edition.status === 'preparing' && edition.drawMode === 'elsewhere';
  const answers = collecting
    ? answersState(
        (await editionPersons(db, edition.id)).map((p) => p.id),
        await findAnswers(db, edition.id, await dataKeyOf(event)),
      )
    : null;
  // « Devine qui » (README 22.17): what its tile and its cards need,
  // never anyone else's guess.
  const game = await gamePayload(
    { db, participation, edition, person, group, rules, ...rest },
    await dataKeyOf(event),
  );
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
  // here; never opened, since the edition was created (a cancelled draw
  // stays told after a new one).
  const since = participation.journalSeenAt ?? edition.createdAt;
  const alertRows = await db
    .select({
      id: auditLog.id,
      type: auditLog.type,
      personId: auditLog.personId,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.partyId, group.id),
        gt(auditLog.createdAt, since),
        inArray(auditLog.type, ALERT_TYPES),
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
    // « ton organisateur » or « tes organisateurs ».
    organizers: await organizerCount(db, group.id),
    editionLabel: edition.label,
    status: edition.status,
    phase: personalPhase(edition.status),
    drawMode: edition.drawMode,
    answer: answers
      ? {
          given: answers.answered.includes(person.id),
          answered: answers.answered.length,
          total: answers.answered.length + answers.missing.length,
        }
      : null,
    // The day of the party is no secret: the messages give it to all.
    eventDate: rules.eventDate,
    // The budget and the organiser's words, shown on every state of the
    // page (lot 16 bis): no secret, the messages give them to all.
    budget: rules.budget,
    guardianMessage: rules.guardianMessage,
    giftHints: rules.giftHints,
    hintsEditable: canEditHints(edition.status, rules.giftHints).ok,
    hasHints: hintsOn && (await participationHasHints(db, participation.id)),
    revealed,
    // Revealed by the organiser: visible to the whole group (README 22.18).
    drawRevealed: Boolean(edition.revealedAt),
    receiverHints: receiver?.state ?? 'none',
    // « Tu pourras lui en demander », while a request is possible.
    canAskHints: canRequestHints({
      status: edition.status,
      mode: rules.giftHints,
      receiverHasHints: receiver?.state !== 'none',
      alreadyRequested: Boolean(request),
    }).ok,
    journalAlerts: unseenAlerts(alertRows, person.id, since),
    guess: game
      ? {
          mode: game.mode,
          open: game.open,
          endsAt: game.endsAt,
          played: game.mine.length > 0,
          revealed: game.revealed,
          // The palmarès exists (one player at least), and was watched.
          palmares: Boolean(game.results && game.results.size !== 'none'),
          seen: Boolean(game.results?.seen),
          // Correction 15: passed their turn, and the count of players.
          skipped: game.skipped,
          canSkip: game.canSkip,
          count: game.count,
        }
      : null,
  };
});
