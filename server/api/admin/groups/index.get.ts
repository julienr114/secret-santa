import { useDb } from '#server/database/client';
import { listManagedGroups, publicGroup } from '#server/database/groups';
import { requireAdmin } from '#server/http/auth';

// The groups of the logged-in account: all of them for a super-admin,
// those they organise for an organiser.
export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event);
  const rows = await listManagedGroups(useDb(event), user);
  return { groups: rows.map(publicGroup) };
});
