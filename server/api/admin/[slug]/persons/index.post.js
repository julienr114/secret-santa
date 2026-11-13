import { persons } from '../../../../database/schema.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { newId, nowIso } from '../../../../http/context.js';
import { validatedBody } from '../../../../http/validate.js';
import { personInputSchema, publicPerson } from '../../../../utils/people.js';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const body = await validatedBody(event, personInputSchema);
  const person = {
    id: newId(),
    groupId: group.id,
    ...body,
    pinHash: null,
    pinSalt: null,
    pinFailedAttempts: 0,
    pinLockedAt: null,
    active: true,
    createdAt: nowIso(),
  };
  await db.insert(persons).values(person);
  setResponseStatus(event, 201);
  return { person: publicPerson(person) };
});
