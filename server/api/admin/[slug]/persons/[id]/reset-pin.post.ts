import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { findPerson } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';

// Forgotten code (README 4.4): the person chooses a new one next time.
// The guardian never sees a code.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  await db
    .update(persons)
    .set({
      pinHash: null,
      pinSalt: null,
      pinFailedAttempts: 0,
      pinLockedAt: null,
    })
    .where(eq(persons.id, person.id));
  await recordEvent(db, {
    type: 'pin_reset',
    groupId: group.id,
    personId: person.id,
    actor: user.role,
  });
  return { ok: true };
});
