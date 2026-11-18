import { recordVisit } from '#server/database/claims';
import { optionalAccount } from '#server/http/auth';
import { listOfLink } from '#server/http/listLink';
import { visitorDocument } from '#server/http/lists';

// A list by its link (README 22.19, maquette ListeVisiteur): readable
// without an account. Opened while logged in, it joins the « Listes » tab
// of the account.
export default defineEventHandler(async (event) => {
  const { db, list } = await listOfLink(event);
  const user = await optionalAccount(event);
  if (user && user.accountId !== list.accountId) {
    await recordVisit(db, list.id, user.accountId);
  }
  return visitorDocument(db, list, user?.accountId ?? null);
});
