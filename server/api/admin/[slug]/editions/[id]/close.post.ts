import { eq } from 'drizzle-orm';
import { editions } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { nextStatus } from '#server/utils/editions';

// After the party: read only, and history for next year's exclusions.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  const status = unwrap(nextStatus(edition.status, 'close'));
  await db
    .update(editions)
    .set({ status, closedAt: nowIso() })
    .where(eq(editions.id, edition.id));
  await recordEvent(db, {
    type: 'edition_closed',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { label: edition.label },
  });
  return { status };
});
