import { removeOffList } from '#server/database/claims';
import { requireAccount } from '#server/http/auth';
import { listOfLink } from '#server/http/listLink';

// Takes back one's own gift not on the list.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db } = await listOfLink(event);
  await removeOffList(
    db,
    getRouterParam(event, 'giftId') ?? '',
    user.accountId,
  );
  return { ok: true };
});
