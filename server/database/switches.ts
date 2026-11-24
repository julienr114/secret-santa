import { eq } from 'drizzle-orm';
import type { Db } from './client';
import { appSwitches } from './schema';
import { nowIso } from '#server/http/context';

// The super-admin's emergency switches (docs/spec/v3/administration.md,
// « En cas d'urgence »). Off until turned on.

export type SwitchName = (typeof appSwitches.$inferSelect)['name'];

/**
 * Whether a switch is on.
 * @param db - The database.
 * @param name - The switch.
 * @returns True once turned on, false without a row.
 */
export const isSwitchOn = async (
  db: Db,
  name: SwitchName,
): Promise<boolean> => {
  const [row] = await db
    .select({ on: appSwitches.on })
    .from(appSwitches)
    .where(eq(appSwitches.name, name));
  return row?.on ?? false;
};

/**
 * Turns a switch on or off.
 * @param db - The database.
 * @param name - The switch.
 * @param on - Its new state.
 * @returns Once stored.
 */
export const setSwitch = async (
  db: Db,
  name: SwitchName,
  on: boolean,
): Promise<void> => {
  const updatedAt = nowIso();
  await db
    .insert(appSwitches)
    .values({ name, on, updatedAt })
    .onConflictDoUpdate({ target: appSwitches.name, set: { on, updatedAt } });
};
