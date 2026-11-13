import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '../../../database/client.js';
import { groups } from '../../../database/schema.js';
import { guardianCredentials, publicGroup } from '../../../database/groups.js';
import { requireSuperAdmin } from '../../../http/auth.js';
import { notFound } from '../../../http/errors.js';
import { secretsOf } from '../../../http/context.js';
import { validatedBody } from '../../../http/validate.js';
import { guardianPasswordSchema } from '../../../utils/auth.js';

const bodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    guardianPassword: guardianPasswordSchema.optional(),
  })
  .refine(
    (b) => b.name !== undefined || b.guardianPassword !== undefined,
    'nothing to update',
  );

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const id = getRouterParam(event, 'id');
  const body = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, id))
    .limit(1);
  if (!group) throw notFound('group_not_found');
  const changes = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.guardianPassword
      ? await guardianCredentials(secretsOf(event), body.guardianPassword)
      : {}),
  };
  await db.update(groups).set(changes).where(eq(groups.id, id));
  return { group: publicGroup({ ...group, ...changes }) };
});
