import { removeInvite } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';

// « Annuler » an invitation to hold the list still waiting (README 22.20).
export default defineEventHandler(async (event) => {
  const { db, list } = await requireHeldList(event);
  await removeInvite(db, list.id, getRouterParam(event, 'inviteId') ?? '');
  return { ok: true };
});
