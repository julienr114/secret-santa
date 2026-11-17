import { eq } from 'drizzle-orm';
import { assignments } from '#server/database/schema';
import { listParticipants } from '#server/database/editions';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { decrypt } from '#server/utils/crypto';

// Who gave to whom, once revealed (README 22.9) or for a closed edition:
// after the party results are no longer secret (decision of 2026-11-13).
// A draw neither revealed nor closed is refused.
export default defineEventHandler(async (event) => {
  const { db, edition } = await requireEdition(event);
  if (edition.status !== 'closed' && !edition.revealedAt) {
    throw createError({ statusCode: 403, statusMessage: 'results_secret' });
  }
  const dataKey = await dataKeyOf(event);
  const [rows, participants] = await Promise.all([
    db.select().from(assignments).where(eq(assignments.editionId, edition.id)),
    listParticipants(db, edition.id),
  ]);
  const pairs = await Promise.all(
    rows.map(async (row) => {
      const receiver = await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      );
      return {
        giverId: row.giverPersonId,
        receiverId: receiver.ok ? receiver.value : null,
      };
    }),
  );
  const order = new Map(participants.map((p, i) => [p.id, i]));
  return {
    pairs: pairs.toSorted(
      (a, b) => (order.get(a.giverId) ?? 0) - (order.get(b.giverId) ?? 0),
    ),
  };
});
