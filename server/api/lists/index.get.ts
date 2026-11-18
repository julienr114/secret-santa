import { useDb } from '#server/database/client';
import { listsHeldBy } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { heldCards } from '#server/http/lists';
import { sortCards } from '#server/utils/lists';

// The « Listes » tab (README 22.19): the lists I hold, still to come by
// date, then the past ones. The lists sent to me join them in lot 22.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const cards = await heldCards(db, await listsHeldBy(db, user.accountId));
  return sortCards(cards);
});
