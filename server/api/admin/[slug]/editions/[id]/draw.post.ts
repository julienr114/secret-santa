import { and, eq } from 'drizzle-orm';
import { assignments, editions } from '#server/database/schema';
import { loadDrawContext } from '#server/database/draw';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { encrypt, secureRandomInt } from '#server/utils/crypto';
import { draw } from '#server/utils/draw';
import { nextStatus } from '#server/utils/editions';

// The draw (README 6.3): server side only, receivers stored encrypted, the
// response never contains an assignment.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  const status = unwrap(nextStatus(edition.status, 'draw'));
  const dataKey = await dataKeyOf(event);
  const { input } = await loadDrawContext(
    db,
    group.id,
    edition,
    rules,
    dataKey,
  );
  const { assignments: pairs } = unwrap(
    draw(input, rules, { random: secureRandomInt }),
  );
  const now = nowIso();
  const rows = await Promise.all(
    pairs.map(async ({ giverId, receiverId }) => {
      const { enc, iv } = await encrypt(receiverId, dataKey);
      return {
        id: newId(),
        editionId: edition.id,
        giverPersonId: giverId,
        receiverEnc: enc,
        receiverIv: iv,
        createdAt: now,
      };
    }),
  );
  const snapshot = {
    rules,
    couples: input.couples,
    manualExclusions: input.manualExclusions,
  };
  // The unique (edition, giver) index makes a concurrent second draw fail.
  await db
    .batch([
      db
        .update(editions)
        .set({ status, drawnAt: now, rulesSnapshot: snapshot })
        .where(
          and(eq(editions.id, edition.id), eq(editions.status, 'invitations')),
        ),
      db.insert(assignments).values(rows),
    ])
    .catch(() => {
      throw createError({
        statusCode: 409,
        statusMessage: 'invalid_transition',
      });
    });
  await recordEvent(db, {
    type: 'draw_done',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { count: rows.length },
  });
  return { ok: true, count: rows.length };
});
