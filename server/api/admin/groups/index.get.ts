import { asc } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { groups } from '#server/database/schema';
import { publicGroup } from '#server/database/groups';
import { requireSuperAdmin } from '#server/http/auth';

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const rows = await useDb(event)
    .select()
    .from(groups)
    .orderBy(asc(groups.name));
  return { groups: rows.map(publicGroup) };
});
