import { asc } from 'drizzle-orm';
import { useDb } from '../../../database/client.js';
import { groups } from '../../../database/schema.js';
import { publicGroup } from '../../../database/groups.js';
import { requireSuperAdmin } from '../../../http/auth.js';

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const rows = await useDb(event)
    .select()
    .from(groups)
    .orderBy(asc(groups.name));
  return { groups: rows.map(publicGroup) };
});
