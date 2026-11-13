import { auditLog } from './schema.js';
import { auditEvent } from '../utils/audit.js';
import { newId, nowIso } from '../http/context.js';

/**
 * Builds and stores a journal event. Invalid events are a programming error.
 * @param {import('drizzle-orm/d1').DrizzleD1Database} db
 */
export const recordEvent = async (db, event) => {
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
