import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { findPerson } from '#server/database/people';
import { requireGroupAccess } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';
import { listOrganizers } from '#server/database/groups';
import { validatedBody } from '#server/http/validate';
import {
  canChangePerson,
  personPatchSchema,
  publicPerson,
} from '#server/utils/people';

// Edits a person. An organiser stays in the group with their address.

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  const patch = await validatedBody(event, personPatchSchema);
  const organizers = await listOrganizers(db, group.id);
  unwrap(
    canChangePerson(
      person.email,
      organizers.map((o) => o.email),
      patch,
    ),
  );
  await db.update(persons).set(patch).where(eq(persons.id, person.id));
  return { person: publicPerson({ ...person, ...patch }) };
});
