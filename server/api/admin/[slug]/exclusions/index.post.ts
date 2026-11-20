import { manualExclusions } from '#server/database/schema';
import { findPerson } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { newId } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { exclusionInputSchema } from '#server/utils/people';

export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const body = await validatedBody(event, exclusionInputSchema);
  const [giver, receiver] = await Promise.all([
    findPerson(db, group.id, body.giverId),
    findPerson(db, group.id, body.receiverId),
  ]);
  if (!giver || !receiver) throw notFound('person_not_found');
  const exclusion = { id: newId(), groupId: group.id, ...body };
  await db
    .insert(manualExclusions)
    .values({ id: exclusion.id, partyId: group.id, ...body });
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    actor: user.role,
  });
  setResponseStatus(event, 201);
  return { exclusion };
});
