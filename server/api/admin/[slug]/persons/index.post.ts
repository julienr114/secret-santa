import { persons } from '#server/database/schema';
import { requireGroupAccess } from '#server/http/auth';
import { newId, nowIso } from '#server/http/context';
import { avatarOf, freshAvatar } from '#server/utils/avatars';
import { countActiveMembers, listPeople } from '#server/database/people';
import { checkPartySize } from '#server/utils/parties';
import { secureRandomInt } from '#server/utils/crypto';
import { validatedBody } from '#server/http/validate';
import {
  canUseEmail,
  personInputSchema,
  publicPerson,
} from '#server/utils/people';
import { findPersonByGroupEmail } from '#server/database/invite';
import { unwrap } from '#server/http/errors';

// Adds a member to a party, up to its 30 members (docs/spec/v3/fete.md):
// the server refuses the thirty-first.
export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const { avatarEmoji, avatarColor, ...body } = await validatedBody(
    event,
    personInputSchema,
  );
  unwrap(checkPartySize((await countActiveMembers(db, group.id)) + 1));
  // One address, one person of the group.
  unwrap(
    canUseEmail(
      body.email,
      body.email
        ? await findPersonByGroupEmail(db, group.id, body.email)
        : null,
    ),
  );
  // A Christmas icon nobody of the group has yet, unless the guardian
  // picked one.
  const avatar = freshAvatar(
    (await listPeople(db, group.id)).map(avatarOf),
    secureRandomInt,
  );
  const person = {
    id: newId(),
    partyId: group.id,
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
