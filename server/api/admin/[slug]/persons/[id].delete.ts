import { eq, or } from 'drizzle-orm';
import {
  auditLog,
  couples,
  manualExclusions,
  persons,
} from '#server/database/schema';
import { findPerson, hasParticipations } from '#server/database/people';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';

// Definitive deletion only for someone who never took part (README 6.6);
// otherwise the guardian deactivates. Couples and exclusions naming the
// person go with them; journal events keep their text but lose the link.
export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  if (await hasParticipations(db, person.id)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'person_has_participations',
    });
  }
  await db.batch([
    db
      .update(auditLog)
      .set({ personId: null })
      .where(eq(auditLog.personId, person.id)),
    db
      .delete(manualExclusions)
      .where(
        or(
          eq(manualExclusions.giverId, person.id),
          eq(manualExclusions.receiverId, person.id),
        ),
      ),
    db
      .delete(couples)
      .where(
        or(eq(couples.personAId, person.id), eq(couples.personBId, person.id)),
      ),
    db.delete(persons).where(eq(persons.id, person.id)),
  ]);
  return { ok: true };
});
