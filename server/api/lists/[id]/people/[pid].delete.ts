import { removePersonFromList } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';

// Takes a person off a list, with their ideas there; they stay in my
// family.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  await removePersonFromList(db, list.id, getRouterParam(event, 'pid') ?? '');
  return { ok: true };
});
