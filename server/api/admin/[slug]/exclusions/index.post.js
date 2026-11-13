import { manualExclusions } from '../../../../database/schema.js';
import { findPerson } from '../../../../database/people.js';
import { recordEvent } from '../../../../database/audit.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { notFound } from '../../../../http/errors.js';
import { newId } from '../../../../http/context.js';
import { validatedBody } from '../../../../http/validate.js';
import { exclusionInputSchema } from '../../../../utils/people.js';

export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const body = await validatedBody(event, exclusionInputSchema);
  const [giver, receiver] = await Promise.all([
    findPerson(db, group.id, body.giverId),
    findPerson(db, group.id, body.receiverId),
  ]);
  if (!giver || !receiver) throw notFound('person_not_found');
  const exclusion = { id: newId(), groupId: group.id, ...body };
  await db.insert(manualExclusions).values(exclusion);
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    actor: user.role,
  });
  setResponseStatus(event, 201);
  return { exclusion };
});
