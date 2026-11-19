import { useDb } from '#server/database/client';
import { countLists } from '#server/database/caps';
import { createList } from '#server/database/lists';
import { requireRoom } from '#server/http/caps';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';
import { newListSchema } from '#server/utils/listSchemas';

// A new list, as a draft (README 22.19): made by the document's first
// change, a name or a date, so that a document left empty is never kept.
// Any account may hold lists, without a quota, up to a wide cap (lot
// 38 A).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, newListSchema);
  const db = useDb(event);
  await requireRoom('lists', countLists(db, user.accountId));
  const id = await createList(db, user.accountId, body);
  setResponseStatus(event, 201);
  return { id };
});
