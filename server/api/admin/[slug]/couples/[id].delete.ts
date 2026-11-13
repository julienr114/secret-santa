import { and, eq } from 'drizzle-orm';
import { couples } from '#server/database/schema';
import { findPerson, listPeople } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { nowIso } from '#server/http/context';
import { displayName } from '#server/utils/people';

// A separation ends the couple; the row stays for history.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const id = getRouterParam(event, 'id') ?? '';
  const [couple] = await db
    .select()
    .from(couples)
    .where(
      and(
        eq(couples.groupId, group.id),
        eq(couples.id, id),
        eq(couples.active, true),
      ),
    )
    .limit(1);
  if (!couple) throw notFound('couple_not_found');
  await db
    .update(couples)
    .set({ active: false, endedAt: nowIso() })
    .where(eq(couples.id, id));
  const [people, partner] = await Promise.all([
    listPeople(db, group.id),
    findPerson(db, group.id, couple.personBId),
  ]);
  await recordEvent(db, {
    type: 'couple_changed',
    groupId: group.id,
    personId: couple.personAId,
    actor: user.role,
    meta: {
      ended: true,
      partnerName: partner ? displayName(partner, people) : '?',
    },
  });
  return { ok: true };
});
