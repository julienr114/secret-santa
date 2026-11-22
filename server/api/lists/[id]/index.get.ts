import { dataKeyOf } from '#server/http/context';
import { listDocument, requireHeldList } from '#server/http/lists';

// The document of a list, for one of those who hold it (README 22.19,
// 22.20).
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  return listDocument(db, list, user.accountId, await dataKeyOf(event));
});
