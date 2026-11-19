import { dropIdea } from '#server/http/ideas';
import { requireLinkWriter } from '#server/http/listLink';

// An idea deleted: its line emptied (README 22.19, 22.20). By the link (lot 25): a person linked to their account
// writes their own ideas, and nobody else's.
export default defineEventHandler(async (event) => {
  const { db, list, may } = await requireLinkWriter(event);
  return dropIdea(event, db, list, may);
});
