import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { groups } from '#server/database/schema';
import { guardianCredentials, publicGroup } from '#server/database/groups';
import { requireSuperAdmin } from '#server/http/auth';
import { newId, nowIso, secretsOf } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { guardianPasswordSchema, slugSchema } from '#server/utils/auth';

const bodySchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  guardianPassword: guardianPasswordSchema.optional(),
});

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const body = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const [existing] = await db
    .select()
    .from(groups)
    .where(eq(groups.slug, body.slug))
    .limit(1);
  if (existing)
    throw createError({ statusCode: 409, statusMessage: 'slug_taken' });
  const credentials = body.guardianPassword
    ? await guardianCredentials(secretsOf(event), body.guardianPassword)
    : {};
  const group: typeof groups.$inferSelect = {
    id: newId(),
    guardianPasswordHash: null,
    guardianPasswordSalt: null,
    slug: body.slug,
    name: body.name,
    rules: {},
    emailSending: false,
    createdAt: nowIso(),
    ...credentials,
  };
  await db.insert(groups).values(group);
  setResponseStatus(event, 201);
  return { group: publicGroup(group) };
});
