import { liveTicket } from '#server/http/live';
import { requireHeldList } from '#server/http/lists';

// The ticket to watch a list live, for one of those who hold it (lot 26,
// README 22.20): they are named to the others who hold it.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  return liveTicket(event, db, list.id, 'holder', user.accountId);
});
