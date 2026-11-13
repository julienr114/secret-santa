import { eq } from 'drizzle-orm';
import { persons } from '#server/database/schema';
import { findPerson } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';

// Locked after too many wrong codes (README 8.2): only the guardian unlocks.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  await db
    .update(persons)
    .set({ pinFailedAttempts: 0, pinLockedAt: null })
    .where(eq(persons.id, person.id));
  await recordEvent(db, {
    type: 'pin_unlocked',
    groupId: group.id,
    personId: person.id,
    actor: user.role,
  });
  return { ok: true };
});
