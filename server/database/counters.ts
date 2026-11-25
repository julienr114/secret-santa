import { like, sql } from 'drizzle-orm';
import type { Db } from './client';
import { appCounters } from './schema';
import { monthOf, type CounterName } from '#server/utils/spend';

// What the app counts by day (ticket 129): one row per day and name,
// counted up in one statement. Best effort: a count that cannot be
// written never stops what is counted.

/**
 * Adds to a counter of a day.
 * @param db - The database.
 * @param name - What is counted.
 * @param day - « 2026-11-24 ».
 * @param by - How many.
 * @returns Once counted, or not.
 */
export const countUp = async (
  db: Db,
  name: CounterName,
  day: string,
  by = 1,
): Promise<void> => {
  await db
    .insert(appCounters)
    .values({ day, name, count: by })
    .onConflictDoUpdate({
      target: [appCounters.day, appCounters.name],
      set: { count: sql`${appCounters.count} + ${by}` },
    })
    .catch(() => undefined);
};

/**
 * The counters of a day, and the month of that day added up.
 * @param db - The database.
 * @param day - « 2026-11-24 ».
 * @returns Each counter of the day, and of the month.
 */
export const countersOf = async (
  db: Db,
  day: string,
): Promise<{
  day: Partial<Record<CounterName, number>>;
  month: Partial<Record<CounterName, number>>;
}> => {
  const rows = await db
    .select()
    .from(appCounters)
    .where(like(appCounters.day, `${monthOf(day)}-%`));
  const add = (picked: typeof rows) =>
    picked.reduce<Partial<Record<CounterName, number>>>(
      (sums, row) => ({
        ...sums,
        [row.name]: (sums[row.name] ?? 0) + row.count,
      }),
      {},
    );
  return { day: add(rows.filter((row) => row.day === day)), month: add(rows) };
};

/**
 * Marks a warning as given, once: true for the one that marked it.
 * @param db - The database.
 * @param name - The warning.
 * @param day - The day it is counted on.
 * @returns True when it was not given yet.
 */
export const markOnce = async (
  db: Db,
  name: CounterName,
  day: string,
): Promise<boolean> => {
  const done = await db
    .insert(appCounters)
    .values({ day, name, count: 1 })
    .onConflictDoNothing()
    .returning({ day: appCounters.day });
  return done.length > 0;
};
