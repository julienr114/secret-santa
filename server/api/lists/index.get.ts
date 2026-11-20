import { useDb } from '#server/database/client';
import { visitedLists } from '#server/database/claims';
import { listsFiguringOn, listsHeldBy } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { listCards, settleArrivals } from '#server/http/lists';
import { isWorthKeeping, sortCards } from '#server/utils/lists';

// The « Listes » tab (README 22.19, 22.20): the lists I hold, alone or
// with others, those I figure on and those I opened while logged in,
// mixed, still to come by date, then the past ones. A
// document left without a name and without anyone is not shown: the page
// that made it deletes it on leaving, when it can.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  // What was waiting for this account: lists it was invited to hold, and
  // the lists it figures on, linked to it.
  await settleArrivals(db, user.accountId);
  const cards = await listCards(
    db,
    user.accountId,
    await listsHeldBy(db, user.accountId),
    await visitedLists(db, user.accountId),
    await listsFiguringOn(db, user.accountId),
  );
  return sortCards(
    cards.filter((card) =>
      isWorthKeeping({
        title: card.title,
        // A list without people has its hidden part.
        peopleCount: card.single ? 1 : card.people.length,
      }),
    ),
  );
});
