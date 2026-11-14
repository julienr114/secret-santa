import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requirePersonalLink } from '#server/http/personal';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import {
  avatarColorSchema,
  avatarEmojiSchema,
  avatarOf,
} from '#server/utils/avatars';
import { canEditAvatar } from '#server/utils/personal';

// A participant picks their own avatar: only theirs, the person comes from
// the link and never from the request body.
const bodySchema = z.object({
  emoji: avatarEmojiSchema,
  color: avatarColorSchema,
});

export default defineEventHandler(async (event) => {
  const { db, edition, person, group } = await requirePersonalLink(event);
  unwrap(canEditAvatar(edition.status));
  const avatar = await validatedBody(event, bodySchema);
  const current = avatarOf(person);
  if (current.emoji === avatar.emoji && current.color === avatar.color) {
    return { avatar };
  }
  await db
    .update(persons)
    .set({ avatarEmoji: avatar.emoji, avatarColor: avatar.color })
    .where(eq(persons.id, person.id));
  // In the journal like every change made with a link: someone holding
  // another person's link cannot alter anything unseen.
  await recordEvent(db, {
    type: 'avatar_changed',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: 'participant',
  });
  return { avatar };
});
