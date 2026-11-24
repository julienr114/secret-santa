import { nextOccurrence } from './categories';

// The form of a new Secret Santa (docs/spec/v3/secret-santa.md, « Le
// créer », V3TirageNouveau): where its values start. Pure.

/**
 * The day of the party of a new Secret Santa: the date of the party this
 * year, or its next one once it is past; without a year yet, the next
 * time its usual day comes; none when the party has no date.
 * @param partyYear - The year of the party now, with its date.
 * @param usualDate - Its usual day, « 12-25 », or null.
 * @param today - ISO day.
 * @returns ISO day, or '' to choose by hand.
 */
export const newSecretSantaDate = (
  partyYear: { year: number; date: string | null } | null,
  usualDate: string | null,
  today: string,
): string => {
  const date = partyYear?.date;
  if (date) {
    return date >= today ? date : nextOccurrence(date.slice(5), today);
  }
  return usualDate ? nextOccurrence(usualDate, today) : '';
};

/**
 * The year of a new Secret Santa: that of its day, or the party's.
 * @param date - Its day (ISO), or ''.
 * @param partyYear - The year of the party now.
 * @param today - ISO day.
 * @returns The year.
 */
export const newSecretSantaYear = (
  date: string,
  partyYear: { year: number } | null,
  today: string,
): number =>
  date
    ? Number(date.slice(0, 4))
    : (partyYear?.year ?? Number(today.slice(0, 4)));
