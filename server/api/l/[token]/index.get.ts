import { recordVisit } from '#server/database/claims';
import { optionalAccount } from '#server/http/auth';
import { openMode } from '#server/http/anonymous';
import { listOfLink } from '#server/http/listLink';
import {
  roleOnList,
  settleArrivals,
  visitorDocument,
} from '#server/http/lists';

// A list by its link (README 22.19, maquette ListeVisiteur): readable
// without an account. Opened while logged in, it joins the « Listes » tab
// of the account.
export default defineEventHandler(async (event) => {
  const { db, list } = await listOfLink(event);
  const user = await optionalAccount(event);
  /**
   * « Mode anonyme » (lot 27 ter): the setting of whoever is logged in
   * and does not hold the list; nothing without a session.
   */
  const modeOf = async (accountId: string) => {
    // Someone whose address a holder gave becomes that person by coming.
    await settleArrivals(db, accountId);
    const { role } = await roleOnList(db, list, accountId);
    if (role === 'holder') return null;
    await recordVisit(db, list.id, accountId);
    return openMode(event, db, list, accountId);
  };
  const mode = user ? await modeOf(user.accountId) : null;
  return {
    ...(await visitorDocument(db, list, user?.accountId ?? null)),
    mode,
  };
});
