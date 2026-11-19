import { addIdea } from '#server/http/ideas';
import { requireLinkWriter } from '#server/http/listLink';

// A new idea for a person of the list, written in its empty line (README
// 22.19). By the link (lot 25): a person linked to their account
// writes their own ideas, and nobody else's.
export default defineEventHandler(async (event) => {
  const { db, list, may } = await requireLinkWriter(event);
  return addIdea(event, db, list, may);
});
