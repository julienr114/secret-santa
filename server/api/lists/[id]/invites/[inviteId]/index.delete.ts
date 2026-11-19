import { removeInvite } from '#server/database/lists';
import { requireManagedList } from '#server/http/lists';

// « Annuler l'invitation » still waiting, or « Effacer » one refused
// (lot 25 bis, README 22.20): its link stops working at once. For those
// who manage the list.
export default defineEventHandler(async (event) => {
  const { db, list } = await requireManagedList(event, 'invite');
  await removeInvite(db, list.id, getRouterParam(event, 'inviteId') ?? '');
  return { ok: true };
});
