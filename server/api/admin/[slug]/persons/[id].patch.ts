import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { findPerson } from '#server/database/people';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { personPatchSchema, publicPerson } from '#server/utils/people';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  const patch = await validatedBody(event, personPatchSchema);
  await db.update(persons).set(patch).where(eq(persons.id, person.id));
  return { person: publicPerson({ ...person, ...patch }) };
});
