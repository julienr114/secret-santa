import { eq } from 'drizzle-orm';
import { persons } from '../../../../database/schema.js';
import { findPerson } from '../../../../database/people.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { notFound } from '../../../../http/errors.js';
import { validatedBody } from '../../../../http/validate.js';
import { personPatchSchema, publicPerson } from '../../../../utils/people.js';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  const patch = await validatedBody(event, personPatchSchema);
  await db.update(persons).set(patch).where(eq(persons.id, person.id));
  return { person: publicPerson({ ...person, ...patch }) };
});
