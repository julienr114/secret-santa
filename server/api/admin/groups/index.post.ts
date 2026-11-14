import { z } from 'zod';
import { like } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { groups } from '#server/database/schema';
import { addOrganizer, publicGroup } from '#server/database/groups';
import { findAccountById } from '#server/database/accounts';
import { quotaAccountOf } from '#server/database/quota';
import { requireAccount } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { canCreateGroup } from '#server/utils/quota';
import { newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { accountEmailSchema } from '#server/utils/accounts';
import { freeSlug, slugSchema, slugify } from '#server/utils/auth';

// Creates a group, with the addresses of its organisers if any (others
// can be added later from the group). Open to super-admins, and to any
// account with room left in its quota, which becomes its first organiser
// (README 22.2).
const bodySchema = z.object({
  // Left out by the app: the identifier is then made from the name.
  slug: slugSchema.optional(),
  name: z.string().trim().min(1).max(100),
  organizers: z.array(accountEmailSchema).max(10).default([]),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  unwrap(canCreateGroup(await quotaAccountOf(db, account)));
  const wanted = body.slug ?? slugify(body.name);
  const taken = (
    await db
      .select({ slug: groups.slug })
      .from(groups)
      .where(like(groups.slug, `${wanted}%`))
  ).map((row) => row.slug);
  if (body.slug && taken.includes(body.slug)) {
    throw createError({ statusCode: 409, statusMessage: 'slug_taken' });
  }
  const slug = freeSlug(wanted, taken);
  const now = nowIso();
  const group: typeof groups.$inferSelect = {
    id: newId(),
    slug,
    name: body.name,
    rules: {},
    createdBy: account.id,
    createdAt: now,
  };
  await db.insert(groups).values(group);
  // One after the other: an address given twice must not race itself.
  const organizers = [
    ...(account.isSuperAdmin ? [] : [account.email]),
    ...body.organizers,
  ];
  await [...new Set(organizers)].reduce<Promise<unknown>>(
    (done, email) =>
      done.then(() => addOrganizer(db, { groupId: group.id, email, now })),
    Promise.resolve(),
  );
  setResponseStatus(event, 201);
  return { group: publicGroup(group) };
});
