import { loadJournal } from '#server/database/journal';
import { requirePersonalLink } from '#server/http/personal';

// The group's public journal, for anyone holding a valid link (README 8.5).
export default defineEventHandler(async (event) => {
  const { db, group, edition } = await requirePersonalLink(event);
  return { ...(await loadJournal(db, group.id)), currentEditionId: edition.id };
});
