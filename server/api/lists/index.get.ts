import { useDb } from '#server/database/client';
import { visitedLists } from '#server/database/claims';
import { listsHeldBy } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { listCards } from '#server/http/lists';
import { isWorthKeeping, sortCards } from '#server/utils/lists';

// The « Listes » tab (README 22.19): the lists I hold and those I opened
// while logged in, mixed, still to come by date, then the past ones. A
// document left without a name and without anyone is not shown: the page
// that made it deletes it on leaving, when it can.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const cards = await listCards(
    db,
    user.accountId,
    await listsHeldBy(db, user.accountId),
    await visitedLists(db, user.accountId),
  );
  return sortCards(
    cards.filter((card) =>
      isWorthKeeping({ title: card.title, peopleCount: card.people.length }),
    ),
  );
});
