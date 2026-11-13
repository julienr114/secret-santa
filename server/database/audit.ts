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
