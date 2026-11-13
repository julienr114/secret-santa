import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { requirePersonalLink } from '#server/http/personal';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { avatarColorSchema, avatarEmojiSchema } from '#server/utils/avatars';
import { canEditAvatar } from '#server/utils/personal';

// A participant picks their own avatar: only theirs, the person comes from
// the link and never from the request body.
const bodySchema = z.object({
  emoji: avatarEmojiSchema,
  color: avatarColorSchema,
});

export default defineEventHandler(async (event) => {
  const { db, edition, person } = await requirePersonalLink(event);
  unwrap(canEditAvatar(edition.status));
  const avatar = await validatedBody(event, bodySchema);
  await db
    .update(persons)
    .set({ avatarEmoji: avatar.emoji, avatarColor: avatar.color })
    .where(eq(persons.id, person.id));
  return { avatar };
});
