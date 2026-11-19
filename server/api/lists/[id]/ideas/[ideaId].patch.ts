import { changeIdea } from '#server/http/ideas';
import { requireHeldList } from '#server/http/lists';

// An idea corrected by touching it (README 22.19). Those who hold the list write for everyone on it.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  return changeIdea(event, db, list, () => true);
});
