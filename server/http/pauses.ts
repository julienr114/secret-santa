import type { Db } from '#server/database/client';
import { isSwitchOn } from '#server/database/switches';

/**
 * « Suspendre les inscriptions » (ticket 129, V3Admin): while it is on,
 * no new account and no new event; logging in, and everything that
 * exists, carry on. A super-admin is never refused.
 * @param db - The database.
 * @param superAdmin - Whether the one asking is a super-admin.
 * @returns Once let through; 403 `signups_paused` otherwise.
 */
export const refuseWhileSignupsPaused = async (
  db: Db,
  superAdmin = false,
): Promise<void> => {
  if (superAdmin || !(await isSwitchOn(db, 'signups'))) return;
  throw createError({ statusCode: 403, statusMessage: 'signups_paused' });
};
