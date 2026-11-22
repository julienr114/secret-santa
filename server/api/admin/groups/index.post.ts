import { isPlainName, WEB_ADDRESS_REFUSED } from '#server/utils/limits';
import { z } from 'zod';
import { like } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { parties } from '#server/database/schema';
import { addOrganizer, publicGroup } from '#server/database/groups';
import { findAccountById } from '#server/database/accounts';
import { requireAccount } from '#server/http/auth';
import { newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { accountEmailSchema } from '#server/utils/accounts';
import { freeSlug, slugSchema, slugify } from '#server/utils/auth';

// Creates a group, with the addresses of its organisers if any (others
// can be added later from the group). Open to any account, which becomes
// its first organiser: a party is free to create (docs/spec/v3/modele.md),
// only its Secret Santa count towards a limit.
const bodySchema = z.object({
  // Left out by the app: the identifier is then made from the name.
  slug: slugSchema.optional(),
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine(isPlainName, WEB_ADDRESS_REFUSED),
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
  const wanted = body.slug ?? slugify(body.name);
  const taken = (
    await db
      .select({ slug: parties.slug })
      .from(parties)
      .where(like(parties.slug, `${wanted}%`))
  ).map((row) => row.slug);
  if (body.slug && taken.includes(body.slug)) {
    throw createError({ statusCode: 409, statusMessage: 'slug_taken' });
  }
  const slug = freeSlug(wanted, taken);
  const now = nowIso();
  const group: typeof parties.$inferSelect = {
    id: newId(),
    slug,
    name: body.name,
    // The screens of before make Christmas groups (ticket 101).
    category: 'christmas',
    iconEmoji: null,
    iconColor: null,
    usualDate: '12-25',
    recurring: true,
    forMemberId: null,
    fromList: false,
    rules: {},
    createdBy: account.id,
    createdAt: now,
  };
  await db.insert(parties).values(group);
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
