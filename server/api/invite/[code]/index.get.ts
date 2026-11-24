import { findAccountById } from '#server/database/accounts';
import {
  findParticipationOf,
  findPersonByGroupEmail,
  participantCount,
} from '#server/database/invite';
import { personalPath } from '#server/database/participations';
import { optionalAccount } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { canSignUp, linkPlaces } from '#server/utils/invite';
import { countActiveMembers } from '#server/database/people';
import { requireInvite } from '#server/http/invite';
import { isIsoDay, mergeRules } from '#server/utils/rules';
import { eq } from 'drizzle-orm';
import { partyYears } from '#server/database/schema';
import { organizerCount } from '#server/database/groups';

// What the link of a Secret Santa shows (ticket 116, V3FeteRejoindre): the
// event and, when it has several Secret Santa the same year, this one's
// name; its category, its date, how many signed up; whether the link still
// lets this visitor in (the draw, the deadline, the places); and, for a
// logged-in account, whether it already takes part (then the way to its
// page) and whether it has a first name.
export default defineEventHandler(async (event) => {
  const { db, santa, santaName, group } = await requireInvite(event);
  const rules = mergeRules(santa.rules);
  const user = await optionalAccount(event);
  const account = user ? await findAccountById(db, user.accountId) : null;
  const person = account
    ? await findPersonByGroupEmail(db, group.id, account.email)
    : null;
  const participation = person
    ? await findParticipationOf(db, santa.id, person.id)
    : null;
  const [active, participants, organizers, [year]] = await Promise.all([
    countActiveMembers(db, group.id),
    participantCount(db, santa.id),
    organizerCount(db, group.id),
    db
      .select({ date: partyYears.date })
      .from(partyYears)
      .where(eq(partyYears.id, santa.yearId))
      .limit(1),
  ]);
  // Its day: the one the Secret Santa gives, else the one of its year.
  const day =
    rules.ok && isIsoDay(rules.value.eventDate)
      ? rules.value.eventDate
      : (year?.date ?? null);
  const today = nowIso().slice(0, 10);
  const open = canSignUp(
    {
      status: santa.status,
      until: santa.inviteUntil,
      places: linkPlaces(santa.invitePlaces, active),
      member: Boolean(person?.active),
    },
    today,
  );
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return {
    groupName: group.name,
    // The name of the Secret Santa, only when the event has several the
    // same year: « Famille Camille (Les adultes) ».
    santaName,
    party: {
      category: group.category,
      iconEmoji: group.iconEmoji,
      date: day,
    },
    message: santa.inviteMessage,
    // « ton organisateur » or « tes organisateurs ».
    organizers,
    edition: {
      label: santa.label,
      status: santa.status,
      participants,
    },
    // The last day the link worked, once it has expired.
    expiredAfter:
      santa.inviteUntil && santa.inviteUntil < today ? santa.inviteUntil : null,
    // Why the link no longer lets this visitor in, or null.
    closed: open.ok ? null : open.reason,
    account: account
      ? {
          email: account.email,
          firstName: account.firstName,
          // Takes part in this Secret Santa already.
          joined: Boolean(participation && person?.active),
          path: participation
            ? await personalPath(participation, await dataKeyOf(event))
            : null,
        }
      : null,
  };
});
