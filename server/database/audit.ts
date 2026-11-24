import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import { auditLog } from './schema';
import {
  auditEvent,
  type AuditEventInput,
  type AuditRow,
} from '#server/utils/audit';
import { newId, nowIso } from '#server/http/context';
import { capRefusal } from '#server/utils/limits';
import { countJournal } from './caps';

/**
 * A journal event as the table stores it: the journal still speaks of a
 * group and an edition, the table of a party and a Secret Santa.
 */
export const auditInsert = ({ groupId, editionId, ...rest }: AuditRow) => ({
  ...rest,
  partyId: groupId,
  secretSantaId: editionId,
});

/** Builds and stores a journal event. Invalid events are a programming error. */
export const recordEvent = async (
  db: Db,
  event: AuditEventInput,
): Promise<AuditRow> => {
  const built = auditEvent(event, { id: newId, now: nowIso });
  if (!built.ok) {
    throw createError({
      statusCode: 500,
      statusMessage: `audit: ${built.details.issues}`,
    });
  }
  // A wide cap per group and per day (lot 38 A): beyond it, what would
  // write one more line is refused, rather than done without a trace.
  const refusal = capRefusal(
    'journal',
    await countJournal(
      db,
      built.value.groupId,
      `${built.value.createdAt.slice(0, 10)}T00:00:00.000Z`,
    ),
  );
  if (refusal) throw createError({ statusCode: 429, statusMessage: refusal });
  await db.insert(auditLog).values(auditInsert(built.value));
  return built.value;
};

/**
 * Whether an edition's draw was ever cancelled, so that the draw it has
 * now, if any, is a new one (decided on 17 November 2026).
 * @param db - The database.
 * @param groupId - The edition's group, which the journal is indexed by.
 * @param editionId - The edition.
 * @returns True once a draw of the edition has been cancelled.
 */
export const wasDrawCancelled = async (
  db: Db,
  groupId: string,
  editionId: string,
): Promise<boolean> => {
  const found = await db
    .select({ id: auditLog.id })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.partyId, groupId),
        eq(auditLog.secretSantaId, editionId),
        eq(auditLog.type, 'draw_cancelled'),
      ),
    )
    .limit(1);
  return found.length > 0;
};
