import { leaveClaim } from '#server/database/claims';
import { requireAccount } from '#server/http/auth';
import { listOfLink } from '#server/http/listLink';

// Untick, or « Finalement, je ne l'offre plus » (README 22.19): a gift
// given by several passes to the next one; alone, the line is free again.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db } = await listOfLink(event);
  await leaveClaim(db, getRouterParam(event, 'ideaId') ?? '', user.accountId);
  return { ok: true };
});
