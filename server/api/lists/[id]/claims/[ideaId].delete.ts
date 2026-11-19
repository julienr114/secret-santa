import { leaveClaim } from '#server/database/claims';
import { requireHeldList } from '#server/http/lists';

// The one who holds a list unticks what they gave, in its document
// (README 22.19).
export default defineEventHandler(async (event) => {
  const { db, user } = await requireHeldList(event);
  await leaveClaim(db, getRouterParam(event, 'ideaId') ?? '', user.accountId);
  return { ok: true };
});
