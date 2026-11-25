import { dateOf, type BirthParts } from './memberFields';

// A date in one field (ticket 160, docs/spec/v3/regles-d-ecran.md, « Les
// dates »): whether what is typed is in its bounds, which we refuse
// ourselves, and the date in full under the field. Pure.

/** The bounds of a date: years, and a last day when it may not come. */
export type DateBounds = {
  /** The first year offered. */
  from: number;
  /** The last year offered. */
  to: number;
  /** The last day allowed (« 2026-11-25 »): a birth is not to come. */
  until?: string;
  /** The first day allowed: a Secret Santa is not in the past. */
  since?: string;
};

/** Where a date typed stands. */
export type DateCheck = 'empty' | 'ok' | 'outside' | 'future' | 'past';

/**
 * Where a date typed stands: not complete, in its bounds, out of its
 * years, or to come when it may not.
 * @param parts - Its day, month and year.
 * @param bounds - Its bounds.
 * @returns Its state.
 */
export const checkDate = (parts: BirthParts, bounds: DateBounds): DateCheck => {
  const iso = dateOf(parts);
  if (!iso || parts.year === null) return 'empty';
  if (parts.year < bounds.from || parts.year > bounds.to) return 'outside';
  if (bounds.until && iso > bounds.until) return 'future';
  if (bounds.since && iso < bounds.since) return 'past';
  return 'ok';
};

/**
 * The bounds of a list of years.
 * @param years - The years offered, in any order.
 * @param until - The last day allowed, if any.
 * @param since - The first day allowed, if any.
 * @returns From the first to the last.
 */
export const boundsOf = (
  years: readonly number[],
  until?: string,
  since?: string,
): DateBounds => ({
  from: Math.min(...years),
  to: Math.max(...years),
  ...(until ? { until } : {}),
  ...(since ? { since } : {}),
});

/**
 * The date in full, under the field: « lundi 14 décembre 2026 » for an
 * event, « 14 mars 2020 » for a birth.
 * @param iso - « 2026-12-14 ».
 * @param locale - The language of the app.
 * @param weekday - Whether to say the day of the week.
 * @returns The words.
 */
export const fullDate = (
  iso: string,
  locale: string,
  weekday: boolean,
): string =>
  new Intl.DateTimeFormat(locale, {
    ...(weekday ? { weekday: 'long' } : {}),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
