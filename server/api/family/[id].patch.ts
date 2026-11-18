import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { findMember } from '#server/database/lists';
import { familyMembers } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { memberPatchSchema } from '#server/utils/listSchemas';

// A person of my family changed (ListePersonne): each part saved on its
// own, the answers and texts merged with those already given.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const row = await findMember(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const body = await validatedBody(event, memberPatchSchema);
  await db
    .update(familyMembers)
    .set({
      ...(body.firstName === undefined ? {} : { firstName: body.firstName }),
      ...(body.avatar
        ? { avatarEmoji: body.avatar.emoji, avatarColor: body.avatar.color }
        : {}),
      ...(body.birthDate === undefined ? {} : { birthDate: body.birthDate }),
      ...(body.clothingSize === undefined
        ? {}
        : { clothingSize: body.clothingSize || null }),
      ...(body.shoeSize === undefined
        ? {}
        : { shoeSize: body.shoeSize || null }),
      ...(body.answers ? { answers: { ...row.answers, ...body.answers } } : {}),
      ...(body.texts ? { texts: { ...row.texts, ...body.texts } } : {}),
    })
    .where(eq(familyMembers.id, row.id));
  return { ok: true };
});
