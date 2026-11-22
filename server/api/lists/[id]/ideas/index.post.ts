import { addIdea } from '#server/http/ideas';
import { requireHeldList } from '#server/http/lists';

// A new idea for a person of the list, written in its empty line (README
// 22.19). Those who hold the list write for everyone on it.
export default defineEventHandler(async (event) => {
  const { db, list, user } = await requireHeldList(event);
  return addIdea(event, db, list, () => true, user.accountId);
});
