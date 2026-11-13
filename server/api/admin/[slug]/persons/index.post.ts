import { persons } from '#server/database/schema';
import { requireGroupAccess } from '#server/http/auth';
import { newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { personInputSchema, publicPerson } from '#server/utils/people';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const body = await validatedBody(event, personInputSchema);
  const person = {
    id: newId(),
    groupId: group.id,
    ...body,
    active: true,
    createdAt: nowIso(),
  };
  await db.insert(persons).values(person);
  setResponseStatus(event, 201);
  return { person: publicPerson(person) };
});
