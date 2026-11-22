import { ownEventOf } from '#server/database/listMembers';
import { countActiveMembers } from '#server/database/people';
import { requireManagedList } from '#server/http/lists';
import { membersLeft } from '#server/utils/parties';
import { canInviteToList } from '#shared/utils/members';

// « Inviter quelqu'un » (V3ListeInviter, ticket 117): whether this list
// makes people come into its event, which one, and how many places are
// left there. For those who manage the list.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireManagedList(event, 'invite');
  const own = await ownEventOf(db, list);
  return {
    partyId: own?.party.id ?? null,
    open: Boolean(
      own && canInviteToList({ manages: true, ownStage: own.stage }),
    ),
    placesLeft: own
      ? membersLeft(await countActiveMembers(db, own.party.id))
      : 0,
  };
});
