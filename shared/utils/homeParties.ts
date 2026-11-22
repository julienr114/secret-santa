import type { PartyCategory } from './categories';
import { nextOccurrence } from './categories';

// The home of the V3 (docs/spec/v3/accueil-et-creation.md, « L'accueil »):
// the sections of Christmas, « Plus tard », the birthdays proposed in
// « Bientôt », the countdown. The date each party is shown at is in
// ./years.ts.

/** How long before a birthday « Bientôt » proposes it (Julien, 20 November 2026). */
export const BIRTHDAY_NOTICE_DAYS = 60;

/**
 * Whole days from one day to another.
 * @param from - « 2026-11-20 ».
 * @param to - « 2026-12-25 ».
 * @returns 35; negative when `to` is before.
 */
export const daysBetween = (from: string, to: string): number =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );

/**
 * The days left until Christmas, 25 December at midnight, whatever the
 * parties: the countdown in the title of its section.
 * @param today - « 2026-11-20 ».
 * @returns 35; 0 on the day itself.
 */
export const daysUntilChristmas = (today: string): number =>
  daysBetween(today, nextOccurrence('12-25', today));

/** What the sections need of a party. */
type Dated = { category: PartyCategory; date: string | null };

/** By date, the nearest first; a party without a date last. */
const byDate = <T extends Dated>(a: T, b: T) =>
  (a.date ?? '9999').localeCompare(b.date ?? '9999');

/**
 * The parties of the home in their sections: one section per season of
 * Christmas, whatever their names (no other category is grouped), then
 * « Plus tard » for the others; each by date. Which parties are still on
 * the home after their day is decided before (shared/utils/years.ts,
 * ticket 108): one a few days past keeps its place, at the top.
 * @param parties - My parties on the home, each with the date it is shown at.
 * @returns The seasons, by year, and the parties after.
 */
export const homeSections = <T extends Dated>(
  parties: readonly T[],
): { seasons: { year: number; parties: T[] }[]; later: T[] } => {
  const coming = parties.toSorted(byDate);
  const inSeason = (party: T): party is T & { date: string } =>
    party.category === 'christmas' && party.date !== null;
  const christmas = coming.filter(inSeason);
  const years = [
    ...new Set(christmas.map((party) => Number(party.date.slice(0, 4)))),
  ];
  return {
    seasons: years.map((year) => ({
      year,
      parties: christmas.filter((party) => party.date.startsWith(`${year}-`)),
    })),
    later: coming.filter((party) => !inSeason(party)),
  };
};

/** A birthday « Bientôt » proposes to prepare. */
export type ComingBirthday = {
  memberId: string;
  firstName: string;
  /** The day, « 2026-12-14 ». */
  date: string;
  /** Days until then. */
  days: number;
  /** The age they turn. */
  age: number;
};

/**
 * The birthdays of my people coming within 60 days, for which none of my
 * parties is a birthday that day: « L'anniversaire de Zoé · dans 24
 * jours · ses 4 ans ». My own is not proposed.
 * @param people - My people, with their birth dates.
 * @param parties - My parties, each with the date it is shown at.
 * @param today - « 2026-11-20 ».
 * @returns The birthdays, the nearest first.
 */
export const comingBirthdays = (
  people: readonly {
    id: string;
    firstName: string;
    birthDate: string | null;
    isSelf: boolean;
  }[],
  parties: readonly Dated[],
  today: string,
): ComingBirthday[] => {
  const prepared = new Set(
    parties.flatMap((party) =>
      party.category === 'birthday' && party.date ? [party.date] : [],
    ),
  );
  return people
    .flatMap((person) => {
      if (person.isSelf || !person.birthDate) return [];
      const date = nextOccurrence(person.birthDate.slice(5, 10), today);
      const days = daysBetween(today, date);
      if (days > BIRTHDAY_NOTICE_DAYS || prepared.has(date)) return [];
      return [
        {
          memberId: person.id,
          firstName: person.firstName,
          date,
          days,
          age: Number(date.slice(0, 4)) - Number(person.birthDate.slice(0, 4)),
        },
      ];
    })
    .toSorted((a, b) => a.date.localeCompare(b.date));
};
