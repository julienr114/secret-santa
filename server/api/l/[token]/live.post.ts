import { optionalAccount } from '#server/http/auth';
import { listOfLink } from '#server/http/listLink';
import { roleOnList } from '#server/http/lists';
import { liveTicket } from '#server/http/live';

// The ticket to watch a list live by its link (lot 26, README 22.20).
// Whoever holds the list is there as such; everyone else, with or
// without an account, is a visitor: counted, never named.
export default defineEventHandler(async (event) => {
  const { db, list } = await listOfLink(event);
  const user = await optionalAccount(event);
  const holds =
    user !== null &&
    (await roleOnList(db, list, user.accountId)).role === 'holder';
  return liveTicket(
    event,
    db,
    list.id,
    holds ? 'holder' : 'visitor',
    user?.accountId ?? null,
  );
});
