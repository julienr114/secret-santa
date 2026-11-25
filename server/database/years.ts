import { asc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { parties, partyYears, secretSantas, type PartyRow } from './schema';
import { notFound } from '#server/http/errors';
import {
  partyTimeline,
  reopensYear,
  yearIsOver,
  type Timeline,
  type YearOfParty,
} from '#shared/utils/years';

// The years of events, as shared/utils/years.ts reads them (ticket 108):
// two queries for any number of events.

/** A year of an event, with its id and its Secret Santa. */
export type LoadedYear = Omit<YearOfParty, 'santas'> & {
  id: string;
  partyId: string;
  santas: { id: string; status: string; label: string; createdAt: string }[];
};

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/** Today, as the server counts the days (UTC). */
export const todayOnServer = () => new Date().toISOString().slice(0, 10);

/**
 * The years of some events, each with its Secret Santa (oldest first).
 * @param db - The database.
 * @param partyIds - The events.
 * @returns Their years.
 */
export const loadYears = async (
  db: Db,
  partyIds: readonly string[],
): Promise<LoadedYear[]> => {
  const [years, santas] = await Promise.all([
    db
      .select({
        id: partyYears.id,
        partyId: partyYears.partyId,
        year: partyYears.year,
        date: partyYears.date,
      })
      .from(partyYears)
      .where(inArray(partyYears.partyId, anyOf(partyIds))),
    db
      .select({
        id: secretSantas.id,
        yearId: secretSantas.yearId,
        status: secretSantas.status,
        label: secretSantas.label,
        createdAt: secretSantas.createdAt,
      })
      .from(secretSantas)
      .where(inArray(secretSantas.partyId, anyOf(partyIds)))
      .orderBy(asc(secretSantas.createdAt)),
  ]);
  return years.map((year) => ({
    ...year,
    santas: santas
      .filter((santa) => santa.yearId === year.id)
      .map(({ yearId: _yearId, ...santa }) => santa),
  }));
};

/**
 * Where an event is in its years.
 * @param party - The event.
 * @param years - The years of this event and maybe others.
 * @param today - « 2027-01-10 ».
 * @returns Its timeline.
 */
export const timelineOf = (
  party: Pick<PartyRow, 'id' | 'recurring' | 'usualDate'>,
  years: readonly LoadedYear[],
  today = todayOnServer(),
): Timeline =>
  partyTimeline(
    party,
    years.filter((year) => year.partyId === party.id),
    today,
  );

/**
 * A year over that a new date opens again (Julien, 25 November 2026): a
 * date set in the past by mistake, in the latest year, where no Secret
 * Santa was drawn. Its date becomes the new one.
 * @param db - The database.
 * @param years - The years of the event.
 * @param year - The year over.
 * @param date - The new date, if one is given.
 * @returns True when it is open again.
 */
const reopenWith = async (
  db: Db,
  years: readonly LoadedYear[],
  year: LoadedYear,
  date: string | undefined,
): Promise<boolean> => {
  if (!date) return false;
  const latest = years.toSorted((a, b) => b.year - a.year)[0];
  if (!reopensYear(year, latest?.id === year.id, date, todayOnServer())) {
    return false;
  }
  await db.update(partyYears).set({ date }).where(eq(partyYears.id, year.id));
  return true;
};

/**
 * Refuses to change a year over (ticket 108): nothing changes in it, by
 * any route; but a new date to come may open it again, while nothing
 * happened in it (`reopensYear`).
 * @param db - The database.
 * @param partyId - The event.
 * @param yearId - The year.
 * @param date - The new date asked, if any.
 * @returns Once checked.
 */
export const requireOpenYear = async (
  db: Db,
  partyId: string,
  yearId: string,
  date?: string,
) => {
  const [party] = await db
    .select({
      id: parties.id,
      recurring: parties.recurring,
      usualDate: parties.usualDate,
    })
    .from(parties)
    .where(eq(parties.id, partyId))
    .limit(1);
  if (!party) throw notFound();
  const years = await loadYears(db, [partyId]);
  const year = years.find((row) => row.id === yearId);
  if (
    year &&
    yearIsOver(timelineOf(party, years), year.year) &&
    !(await reopenWith(db, years, year, date))
  ) {
    throw createError({ statusCode: 409, statusMessage: 'year_over' });
  }
};

/**
 * The same, for a year by its number.
 * @param db - The database.
 * @param party - The event.
 * @param year - « 2025 ».
 * @param date - The new date asked, if any.
 * @returns Once checked.
 */
export const requireOpenYearNumber = async (
  db: Db,
  party: Pick<PartyRow, 'id' | 'recurring' | 'usualDate'>,
  year: number,
  date?: string,
) => {
  const years = await loadYears(db, [party.id]);
  const row = years.find((one) => one.year === year);
  if (
    yearIsOver(timelineOf(party, years), year) &&
    !(row && (await reopenWith(db, years, row, date)))
  ) {
    throw createError({ statusCode: 409, statusMessage: 'year_over' });
  }
};
