import { unlinkDraw } from '#server/database/drawLists';
import { sharedEventsOf } from '#server/database/listSharing';
import { notFound } from '#server/http/errors';
import { requireManagedList } from '#server/http/lists';

// « Délier » (docs/spec/v3/listes.md, « Lier et délier », ticket 148),
// and the cross of « Celui qui m'a tiré » in « Qui voit ta liste ? »: the
// one who drew me no longer sees the list by this way. Its ideas and its
// ticks stay; shared with all the members of the event, it stays so.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireManagedList(event, 'share');
  const partyId = getRouterParam(event, 'partyId') ?? '';
  const shared = await sharedEventsOf(db, list.id);
  if (!shared.some((row) => row.id === partyId && row.giver)) throw notFound();
  await unlinkDraw(db, list.id, partyId);
  return { ok: true };
});
