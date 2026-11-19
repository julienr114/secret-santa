import { dropIdea } from '#server/http/ideas';
import { requireHeldList } from '#server/http/lists';

// An idea deleted: its line emptied (README 22.19, 22.20). Those who hold the list write for everyone on it.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  return dropIdea(event, db, list, () => true);
});
