import { eq } from 'drizzle-orm';
import { editions } from '#server/database/schema';
import { requireEdition } from '#server/http/edition';
import { unwrap } from '#server/http/errors';
import { nextStatus } from '#server/utils/editions';

// Draft -> invitations: links can now be sent.
export default defineEventHandler(async (event) => {
  const { db, edition } = await requireEdition(event);
  const status = unwrap(nextStatus(edition.status, 'open'));
  await db.update(editions).set({ status }).where(eq(editions.id, edition.id));
  return { status };
});
