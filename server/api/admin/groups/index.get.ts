import { useDb } from '#server/database/client';
import { listManagedGroups, publicGroup } from '#server/database/groups';
import { loadGroupOverviews } from '#server/database/overview';
import { requireAdmin } from '#server/http/auth';

// The groups of the logged-in account: all of them for a super-admin,
// those they organise for an organiser; each with its members and where
// its draw in progress stands.
export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event);
  const db = useDb(event);
  const [rows, overviews] = await Promise.all([
    listManagedGroups(db, user),
    loadGroupOverviews(db),
  ]);
  return {
    groups: rows.map((group) => ({
      ...publicGroup(group),
      ...(overviews[group.id] ?? { members: 0, draw: null }),
    })),
  };
});
