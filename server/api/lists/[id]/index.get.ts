import { listDocument, requireHeldList } from '#server/http/lists';

// The document of a list, for the one who holds it (README 22.19).
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  return listDocument(db, list);
});
