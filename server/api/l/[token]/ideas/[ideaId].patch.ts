import { changeIdea } from '#server/http/ideas';
import { requireLinkWriter } from '#server/http/listLink';

// An idea corrected by touching it (README 22.19). By the link (lot 25): a person linked to their account
// writes their own ideas, and nobody else's.
export default defineEventHandler(async (event) => {
  const { db, list, may } = await requireLinkWriter(event);
  return changeIdea(event, db, list, may);
});
