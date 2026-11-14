import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { groups } from '#server/database/schema';
import { addOrganizer, publicGroup } from '#server/database/groups';
import { requireSuperAdmin } from '#server/http/auth';
import { newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { accountEmailSchema } from '#server/utils/accounts';
import { slugSchema } from '#server/utils/auth';

// Creates a group, with the addresses of its organisers if any (others
// can be added later from the group). Super-admin only.
const bodySchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  organizers: z.array(accountEmailSchema).max(10).default([]),
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
  const now = nowIso();
  const group: typeof groups.$inferSelect = {
    id: newId(),
    slug: body.slug,
    name: body.name,
    rules: {},
    createdAt: now,
  };
  await db.insert(groups).values(group);
  // One after the other: an address given twice must not race itself.
  await [...new Set(body.organizers)].reduce<Promise<unknown>>(
    (done, email) =>
      done.then(() => addOrganizer(db, { groupId: group.id, email, now })),
    Promise.resolve(),
  );
  setResponseStatus(event, 201);
  return { group: publicGroup(group) };
});
