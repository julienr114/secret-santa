import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '../../../database/client.js';
import { groups } from '../../../database/schema.js';
import { guardianCredentials, publicGroup } from '../../../database/groups.js';
import { requireSuperAdmin } from '../../../http/auth.js';
import { newId, nowIso, secretsOf } from '../../../http/context.js';
import { validatedBody } from '../../../http/validate.js';
import { guardianPasswordSchema, slugSchema } from '../../../utils/auth.js';

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
  const group = {
    id: newId(),
    slug: body.slug,
    name: body.name,
    rules: {},
    createdAt: nowIso(),
    ...credentials,
  };
  await db.insert(groups).values(group);
  setResponseStatus(event, 201);
  return { group: publicGroup(group) };
});
