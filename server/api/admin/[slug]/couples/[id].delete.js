import { and, eq } from 'drizzle-orm';
import { couples } from '../../../../database/schema.js';
import { findPerson, listPeople } from '../../../../database/people.js';
import { recordEvent } from '../../../../database/audit.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { notFound } from '../../../../http/errors.js';
import { nowIso } from '../../../../http/context.js';
import { displayName } from '../../../../utils/people.js';

// A separation ends the couple; the row stays for history.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const id = getRouterParam(event, 'id');
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
