import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import { auditLog } from './schema';
import {
  auditEvent,
  type AuditEventInput,
  type AuditRow,
} from '#server/utils/audit';
import { newId, nowIso } from '#server/http/context';

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
  await db.insert(auditLog).values(built.value);
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
        eq(auditLog.groupId, groupId),
        eq(auditLog.editionId, editionId),
        eq(auditLog.type, 'draw_cancelled'),
      ),
    )
    .limit(1);
  return found.length > 0;
};
