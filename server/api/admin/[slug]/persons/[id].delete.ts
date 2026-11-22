import { forgetEntries } from '#server/database/members';
import { eq, or } from 'drizzle-orm';
import { auditLog, manualExclusions, persons } from '#server/database/schema';
import { findPerson, hasParticipations } from '#server/database/people';
import { listOrganizers } from '#server/database/groups';
import { canChangePerson } from '#server/utils/people';
import { requireGroupAccess } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';

// Definitive deletion only for someone who never took part (README 6.6);
// otherwise the guardian deactivates. Exclusions naming the person go with
// them; journal events keep their text but lose the link.
export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const person = await findPerson(db, group.id, getRouterParam(event, 'id'));
  if (!person) throw notFound('person_not_found');
  const organizers = await listOrganizers(db, group.id);
  unwrap(
    canChangePerson(
      person.email,
      organizers.map((o) => o.email),
      'delete',
    ),
  );
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
    forgetEntries(db, { personIds: [person.id] }),
    db.delete(persons).where(eq(persons.id, person.id)),
  ]);
  return { ok: true };
});
