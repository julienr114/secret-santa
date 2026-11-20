import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import {
  assignments,
  auditLog,
  giftListParties,
  secretSantas,
  parties,
  partyOrganisers,
  partyYears,
  manualExclusions,
  participations,
  persons,
} from '#server/database/schema';
import { deleteHintsOf } from '#server/database/hints';
import { deleteAnswersOfParticipations } from '#server/database/answers';
import { deleteGuessesOf } from '#server/database/guesses';
import { requireSuperAdmin } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';

// Deletes a group with everything it owns: people, exclusions, years,
// editions, draws, wish lists and journal; its lists leave it. Super-admin only, and irreversible, so
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
    .from(parties)
    .where(eq(parties.id, id))
    .limit(1);
  if (!group) throw notFound('group_not_found');
  if (confirm.trim() !== group.slug) {
    throw createError({ statusCode: 400, statusMessage: 'wrong_confirmation' });
  }
  const editionIds = db
    .select({ id: secretSantas.id })
    .from(secretSantas)
    .where(eq(secretSantas.partyId, id));
  const participationIds = db
    .select({ id: participations.id })
    .from(participations)
    .where(inArray(participations.secretSantaId, editionIds));
  await db.batch([
    ...deleteHintsOf(db, participationIds),
    deleteAnswersOfParticipations(db, participationIds),
    deleteGuessesOf(db, editionIds),
    db
      .delete(assignments)
      .where(inArray(assignments.secretSantaId, editionIds)),
    db.delete(auditLog).where(eq(auditLog.partyId, id)),
    db
      .delete(participations)
      .where(inArray(participations.secretSantaId, editionIds)),
    db.delete(manualExclusions).where(eq(manualExclusions.partyId, id)),
    db.delete(secretSantas).where(eq(secretSantas.partyId, id)),
    db.delete(partyYears).where(eq(partyYears.partyId, id)),
    db.delete(giftListParties).where(eq(giftListParties.partyId, id)),
    db.delete(persons).where(eq(persons.partyId, id)),
    db.delete(partyOrganisers).where(eq(partyOrganisers.partyId, id)),
    db.delete(parties).where(eq(parties.id, id)),
  ]);
  return { ok: true };
});
