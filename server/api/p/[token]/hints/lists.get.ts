import { requireAccount } from '#server/http/auth';
import { linkableLists } from '#server/http/hints';
import { requirePersonalLink } from '#server/http/personal';

// « Quelle liste ? » (lot 27 ter, maquette PistesListeChoisir): the gift
// lists the account logged in holds or figures on, to link one to these
// hints. An account is needed: a personal link alone has no lists.
export default defineEventHandler(async (event) => {
  const { db } = await requirePersonalLink(event);
  const user = await requireAccount(event);
  return linkableLists(db, user.accountId);
});
