import { isPlainName, WEB_ADDRESS_REFUSED } from '#server/utils/limits';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { parties } from '#server/database/schema';
import { publicGroup } from '#server/database/groups';
import { requireSuperAdmin } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';

// Renames a group. Super-admin only.
const bodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine(isPlainName, WEB_ADDRESS_REFUSED),
});

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const id = getRouterParam(event, 'id') ?? '';
  const body = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const [group] = await db
    .select()
    .from(parties)
    .where(eq(parties.id, id))
    .limit(1);
  if (!group) throw notFound('group_not_found');
  await db.update(parties).set({ name: body.name }).where(eq(parties.id, id));
  return { group: publicGroup({ ...group, name: body.name }) };
});
