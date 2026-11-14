import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import {
  assignments,
  auditLog,
  editions,
  groups,
  groupMembers,
  manualExclusions,
  participations,
  persons,
  wishes,
} from '#server/database/schema';
import { requireSuperAdmin } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';

// Deletes a group with everything it owns: people, exclusions, editions,
// draws, wish lists and journal. Super-admin only, and irreversible, so
// the request must repeat the group's identifier (a POST with a body: a
// body on DELETE is not carried reliably by every runtime). One
// transaction, in the order the foreign keys allow.
const bodySchema = z.object({ confirm: z.string() });

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const id = getRouterParam(event, 'id') ?? '';
  const { confirm } = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, id))
    .limit(1);
  if (!group) throw notFound('group_not_found');
  if (confirm.trim() !== group.slug) {
    throw createError({ statusCode: 400, statusMessage: 'wrong_confirmation' });
  }
  const editionIds = db
    .select({ id: editions.id })
    .from(editions)
    .where(eq(editions.groupId, id));
  const participationIds = db
    .select({ id: participations.id })
    .from(participations)
    .where(inArray(participations.editionId, editionIds));
  await db.batch([
    db.delete(wishes).where(inArray(wishes.participationId, participationIds)),
    db.delete(assignments).where(inArray(assignments.editionId, editionIds)),
    db.delete(auditLog).where(eq(auditLog.groupId, id)),
    db
      .delete(participations)
      .where(inArray(participations.editionId, editionIds)),
    db.delete(manualExclusions).where(eq(manualExclusions.groupId, id)),
    db.delete(editions).where(eq(editions.groupId, id)),
    db.delete(persons).where(eq(persons.groupId, id)),
    db.delete(groupMembers).where(eq(groupMembers.groupId, id)),
    db.delete(groups).where(eq(groups.id, id)),
  ]);
  return { ok: true };
});
