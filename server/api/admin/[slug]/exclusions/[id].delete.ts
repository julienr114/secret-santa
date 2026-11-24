import { and, eq } from 'drizzle-orm';
import { manualExclusions } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';

export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const id = getRouterParam(event, 'id') ?? '';
  const deleted = await db
    .delete(manualExclusions)
    .where(
      and(eq(manualExclusions.partyId, group.id), eq(manualExclusions.id, id)),
    )
    .returning({ id: manualExclusions.id });
  if (deleted.length === 0) throw notFound('exclusion_not_found');
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    actor: user.role,
  });
  return { ok: true };
});
