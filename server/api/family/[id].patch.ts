import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { findAccountByEmail } from '#server/database/accounts';
import { findReachableMember, setSelfAvatar } from '#server/database/lists';
import { avatarOf } from '#server/utils/avatars';
import { familyMembers } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { memberPatchSchema } from '#server/utils/listSchemas';

// One of my people changed (ListePersonne), or a person of a list I hold:
// each part saved on its own, the answers and texts merged with those already given.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const row = await findReachableMember(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const body = await validatedBody(event, memberPatchSchema);
  // A person who has an account chooses their own name and icon.
  const theirs = row.isSelf ? row.accountId : row.linkedAccountId;
  if (
    theirs &&
    theirs !== user.accountId &&
    (body.firstName !== undefined || body.avatar)
  ) {
    throw createError({ statusCode: 403, statusMessage: 'member_linked' });
  }
  // « Son compte » (lot 25): the address links them to their account, at
  // once when it exists, when it comes otherwise; emptied, no more.
  // Only for one of my own people, and never for « Moi ».
  if (
    body.email !== undefined &&
    (row.isSelf || row.accountId !== user.accountId)
  ) {
    throw createError({ statusCode: 403, statusMessage: 'member_not_mine' });
  }
  const account = body.email ? await findAccountByEmail(db, body.email) : null;
  const linked = account ? avatarOf(account) : null;
  await db
    .update(familyMembers)
    .set({
      ...(body.firstName === undefined ? {} : { firstName: body.firstName }),
      ...(body.avatar
        ? { avatarEmoji: body.avatar.emoji, avatarColor: body.avatar.color }
        : {}),
      ...(body.email === undefined
        ? {}
        : {
            email: body.email,
            linkedAccountId: account?.id ?? null,
            // Linked, they have the icon of their account.
            ...(linked
              ? { avatarEmoji: linked.emoji, avatarColor: linked.color }
              : {}),
          }),
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
  // The icon of « Moi » is the account's: changed here, it changes there.
  if (theirs === user.accountId && body.avatar) {
    await setSelfAvatar(db, user.accountId, body.avatar);
  }
  return { ok: true };
});
