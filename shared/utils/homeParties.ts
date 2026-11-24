import type { PartyCategory } from './categories';
import { nextOccurrence } from './categories';

// The home of the V3 (docs/spec/v3/accueil-et-creation.md, « L'accueil »):
// the parties by date, the sections of Christmas, the birthdays proposed
// in « Bientôt », « Plus tard », the countdown. The date each party is shown at is in
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

/** A block of the home, in its order. */
export type HomeBlock<T> =
  | { kind: 'cards'; later: boolean; parties: T[] }
  | { kind: 'season'; year: number; parties: T[] }
  | { kind: 'soon' };

/**
 * The parties of the home in their order (2026-11-21-l-accueil-suit-les-
 * dates.md, V3AccueilAvantNoel): by date; the Christmas parties of a year
 * (no other category is grouped) form a section, set at the place of the
 * first of them; what comes before is above it, without a title;
 * « Bientôt » comes after the first section of Christmas, then « Plus
 * tard ». Without a season of Christmas, cards without a title, then
 * « Bientôt ». A season of another year keeps its own section, at its
 * date (Q-014). Which parties are still on the home after their day is
 * decided before (shared/utils/years.ts, ticket 108): one a few days
 * past keeps its place, at the top.
 * @param parties - My parties on the home, each with the date it is shown at.
 * @returns The blocks, in their order.
 */
export const homeBlocks = <T extends Dated>(
  parties: readonly T[],
): HomeBlock<T>[] => {
  const coming = parties.toSorted(byDate);
  const yearOf = (party: T): number | null =>
    party.category === 'christmas' && party.date !== null
      ? Number(party.date.slice(0, 4))
      : null;
  const blocks = coming.reduce<HomeBlock<T>[]>((done, party) => {
    const year = yearOf(party);
    const seasons = done.filter((block) => block.kind === 'season');
    if (year !== null) {
      if (seasons.some((block) => block.year === year)) return done;
      const season: HomeBlock<T> = {
        kind: 'season',
        year,
        parties: coming.filter((other) => yearOf(other) === year),
      };
      return seasons.length === 0
        ? [...done, season, { kind: 'soon' }]
        : [...done, season];
    }
    const last = done.at(-1);
    if (last?.kind === 'cards') {
      return [
        ...done.slice(0, -1),
        { ...last, parties: [...last.parties, party] },
      ];
    }
    const later =
      seasons.length > 0 &&
      !done.some((block) => block.kind === 'cards' && block.later);
    return [...done, { kind: 'cards', later, parties: [party] }];
  }, []);
  return blocks.some((block) => block.kind === 'soon')
    ? blocks
    : [...blocks, { kind: 'soon' }];
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
 * parties is a birthday that day, nor one made for them whatever its date
 * (ticket 118): « L'anniversaire de Zoé · dans 24 jours · ses 4 ans ». My
 * own is not proposed.
 * @param people - My people, with their birth dates.
 * @param parties - My parties, each with the date it is shown at and whom
 *   it is for.
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
  parties: readonly (Dated & { forMemberId?: string | null })[],
  today: string,
): ComingBirthday[] => {
  const birthdays = parties.filter((party) => party.category === 'birthday');
  const prepared = new Set(
    birthdays.flatMap((party) => (party.date ? [party.date] : [])),
  );
  const theirs = new Set(birthdays.map((party) => party.forMemberId));
  return people
    .flatMap((person) => {
      if (person.isSelf || !person.birthDate || theirs.has(person.id)) {
        return [];
      }
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
