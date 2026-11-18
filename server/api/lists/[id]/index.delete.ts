import { deleteList } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';

// A document left without a name and without anyone is not kept (README
// 22.19); only a draft goes, a shared list stays.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  if (list.sharedAt) {
    throw createError({ statusCode: 409, statusMessage: 'list_shared' });
  }
  await deleteList(db, list.id);
  return { ok: true };
});
