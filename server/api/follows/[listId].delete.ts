import { useDb } from '#server/database/client';
import { saveFollow } from '#server/database/follows';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';

// « Ne plus suivre », in « Me prévenir » (ticket 122): nothing followed on
// that list any more. Only my own follows: nothing to check on the list.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  await saveFollow(
    useDb(event),
    {
      accountId: user.accountId,
      listId: getRouterParam(event, 'listId') ?? '',
      choice: { list: false, people: [] },
    },
    nowIso(),
  );
  return { ok: true };
});
