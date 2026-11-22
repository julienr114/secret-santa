import type { H3Event } from 'h3';
import { ownEventOf } from '#server/database/listMembers';
import { countActiveMembers } from '#server/database/people';
import { membersLeft } from '#server/utils/parties';
import { canInviteToList } from '#shared/utils/members';
import { requireManagedList } from './lists';

/**
 * A list whose manager may make someone come into its event (docs/spec/
 * v3/listes.md, « Inviter quelqu'un »): shared with all the members of
 * its own event. Anything else gets 409 `list_not_open`: a draft, a list
 * kept for the one who drew, a list without an event.
 * @param event - The request, with the list's id in its path.
 * @returns The database, me, the list, its event and the places left.
 */
export const requireListInvite = async (event: H3Event) => {
  const held = await requireManagedList(event, 'invite');
  const own = await ownEventOf(held.db, held.list);
  if (!own || !canInviteToList({ manages: true, ownStage: own.stage })) {
    throw createError({ statusCode: 409, statusMessage: 'list_not_open' });
  }
  return {
    ...held,
    party: own.party,
    placesLeft: membersLeft(await countActiveMembers(held.db, own.party.id)),
  };
};
