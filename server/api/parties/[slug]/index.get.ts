import { loadPartyPage } from '#server/database/parties';
import { dataKeyOf } from '#server/http/context';
import { requireParty } from '#server/http/party';

// The page of a party (ticket 104), for its members and its organisers.
export default defineEventHandler(async (event) => {
  const { db, party, account, role, me } = await requireParty(event);
  return loadPartyPage(db, {
    party,
    account,
    role,
    me,
    dataKey: await dataKeyOf(event),
  });
});
