import { findAccountById } from '#server/database/accounts';
import {
  findParticipationOf,
  findPersonByGroupEmail,
  participantCount,
} from '#server/database/invite';
import { personalPath } from '#server/database/participations';
import { optionalAccount } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { canJoinGroup } from '#server/utils/invite';
import { requireInvite } from '#server/http/invite';
import { mergeRules } from '#server/utils/rules';
import { organizerCount } from '#server/database/groups';

// What an invitation link shows: the group, its draw in progress if any,
// whether the link still lets people in (deadline, places), and, for a
// logged-in account, whether it is already in (then the way to its draw,
// if it takes part) and whether it has a first name.
export default defineEventHandler(async (event) => {
  const { db, edition, group } = await requireInvite(event);
  const rules = edition ? mergeRules(edition.rules) : null;
  const user = await optionalAccount(event);
  const account = user ? await findAccountById(db, user.accountId) : null;
  const person = account
    ? await findPersonByGroupEmail(db, group.id, account.email)
    : null;
  const participation =
    person && edition
      ? await findParticipationOf(db, edition.id, person.id)
      : null;
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return {
    groupName: group.name,
    message: group.inviteMessage,
    // « ton organisateur » or « tes organisateurs ».
    organizers: await organizerCount(db, group.id),
    edition: edition
      ? {
          label: edition.label,
          // Drawn already: whoever joins now is in the group, not this draw.
          status: edition.status,
          hintsOn: rules?.ok ? rules.value.giftHints !== 'none' : true,
          eventDate: rules?.ok ? rules.value.eventDate : '',
          participants: await participantCount(db, edition.id),
        }
      : null,
    // The last day the link worked, once it has expired.
    expiredAfter:
      group.inviteUntil && group.inviteUntil < nowIso().slice(0, 10)
        ? group.inviteUntil
        : null,
    // Why the link no longer lets anyone in, or null.
    closed: (() => {
      const open = canJoinGroup(
        { until: group.inviteUntil, places: group.invitePlaces ?? 0 },
        nowIso().slice(0, 10),
      );
      return open.ok ? null : open.reason;
    })(),
    account: account
      ? {
          email: account.email,
          firstName: account.firstName,
          member: Boolean(person?.active),
          path: participation
            ? await personalPath(participation, await dataKeyOf(event))
            : null,
        }
      : null,
  };
});
