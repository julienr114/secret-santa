import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { groups } from '#server/database/schema';
import { guardianCredentials, publicGroup } from '#server/database/groups';
import { requireSuperAdmin } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { secretsOf } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { guardianPasswordSchema } from '#server/utils/auth';

const bodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    guardianPassword: guardianPasswordSchema.optional(),
    // Bulk sending by email: a super-admin decision, never the guardian's.
    emailSending: z.boolean().optional(),
  })
  .refine(
    (b) =>
      b.name !== undefined ||
      b.guardianPassword !== undefined ||
      b.emailSending !== undefined,
    'nothing to update',
  );

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const id = getRouterParam(event, 'id') ?? '';
  const body = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, id))
    .limit(1);
  if (!group) throw notFound('group_not_found');
  const changes: Partial<typeof groups.$inferInsert> = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.emailSending !== undefined
      ? { emailSending: body.emailSending }
      : {}),
    ...(body.guardianPassword
      ? await guardianCredentials(secretsOf(event), body.guardianPassword)
      : {}),
  };
  await db.update(groups).set(changes).where(eq(groups.id, id));
  return { group: publicGroup({ ...group, ...changes }) };
});
