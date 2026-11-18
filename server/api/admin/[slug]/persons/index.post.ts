import { persons } from '#server/database/schema';
import { requireGroupAccess } from '#server/http/auth';
import { newId, nowIso } from '#server/http/context';
import { randomAvatar } from '#server/utils/avatars';
import { secureRandomInt } from '#server/utils/crypto';
import { validatedBody } from '#server/http/validate';
import {
  canUseEmail,
  personInputSchema,
  publicPerson,
} from '#server/utils/people';
import { findPersonByGroupEmail } from '#server/database/invite';
import { unwrap } from '#server/http/errors';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const { avatarEmoji, avatarColor, ...body } = await validatedBody(
    event,
    personInputSchema,
  );
  // One address, one person of the group.
  unwrap(
    canUseEmail(
      body.email,
      body.email
        ? await findPersonByGroupEmail(db, group.id, body.email)
        : null,
    ),
  );
  // Random Christmas avatar unless the guardian picked one.
  const avatar = randomAvatar(secureRandomInt);
  const person = {
    id: newId(),
    groupId: group.id,
    ...body,
    avatarEmoji: avatarEmoji ?? avatar.emoji,
    avatarColor: avatarColor ?? avatar.color,
    active: true,
    createdAt: nowIso(),
  };
  await db.insert(persons).values(person);
  setResponseStatus(event, 201);
  return { person: publicPerson(person) };
});
