import { describe, expect, it } from 'vitest';
import {
  SHOE_SIZES,
  birthDateOf,
  birthParts,
  birthYears,
  daysIn,
  settleBirth,
  shoeSizesOf,
  shoeSizesShown,
  shoeSizesText,
  toggleShoeSize,
  dateOf,
  partyYears,
} from './memberFields';

describe('the shoe sizes of someone', () => {
  it('offers 16 to 34 for a child, 35 to 50 beyond', () => {
    expect(SHOE_SIZES.child[0]).toBe(16);
    expect(SHOE_SIZES.child.at(-1)).toBe(34);
    expect(SHOE_SIZES.adult[0]).toBe(35);
    expect(SHOE_SIZES.adult.at(-1)).toBe(50);
  });

  it('writes one or several, in rising order', () => {
    expect(shoeSizesText([], 'ou')).toBeNull();
    expect(shoeSizesText([30], 'ou')).toBe('30');
    expect(shoeSizesText([31, 30], 'ou')).toBe('30 ou 31');
    expect(shoeSizesText([32, 30, 31], 'ou')).toBe('30, 31 ou 32');
    expect(shoeSizesText([31, 30, 31], 'or')).toBe('30 or 31');
  });

  it('reads back what it wrote, in any of the three languages', () => {
    expect(shoeSizesOf(null)).toEqual([]);
    expect(shoeSizesOf('30')).toEqual([30]);
    expect(shoeSizesOf('30 ou 31')).toEqual([30, 31]);
    expect(shoeSizesOf('30, 31 oder 32')).toEqual([30, 31, 32]);
    expect(shoeSizesOf('31 OR 30')).toEqual([30, 31]);
  });

  it('leaves alone a size written by hand before the grid', () => {
    expect(shoeSizesOf('30,5')).toBeNull();
    expect(shoeSizesOf('30 large')).toBeNull();
    expect(shoeSizesOf('12')).toBeNull();
    expect(shoeSizesOf('305')).toBeNull();
  });

  it('shows the sizes with the word of the reader, anything else as written', () => {
    expect(shoeSizesShown('30 ou 31', 'or')).toBe('30 or 31');
    expect(shoeSizesShown('30', 'oder')).toBe('30');
    expect(shoeSizesShown('30,5', 'or')).toBe('30,5');
    expect(shoeSizesShown(null, 'or')).toBeNull();
    expect(shoeSizesShown('', 'or')).toBeNull();
  });

  it('ticks a size, and unticks it', () => {
    expect(toggleShoeSize([], 30)).toEqual([30]);
    expect(toggleShoeSize([31], 30)).toEqual([30, 31]);
    expect(toggleShoeSize([30, 31], 30)).toEqual([31]);
  });
});

describe('a date of birth, in three lists', () => {
  const TODAY = '2026-11-19';
  const none = { day: null, month: null, year: null };

  it('offers this year first, back to 110 years ago', () => {
    const years = birthYears(2026);
    expect(years[0]).toBe(2026);
    expect(years.at(-1)).toBe(1916);
    expect(years).toHaveLength(111);
  });

  it('gives a month its days, by the year', () => {
    expect(daysIn(null, null)).toBe(31);
    expect(daysIn(4, 2020)).toBe(30);
    expect(daysIn(2, 2020)).toBe(29);
    expect(daysIn(2, 2021)).toBe(28);
    // The year not chosen yet: a 29 February can still be said.
    expect(daysIn(2, null)).toBe(29);
  });

  it('reads a saved date into its parts', () => {
    expect(birthParts('2020-03-14')).toEqual({ day: 14, month: 3, year: 2020 });
    expect(birthParts(null)).toEqual(none);
    expect(birthParts('14/03/2020')).toEqual(none);
  });

  it('leaves a day the month no longer has to be chosen again', () => {
    expect(settleBirth({ day: 31, month: 4, year: 2020 }).day).toBeNull();
    expect(settleBirth({ day: 29, month: 2, year: 2021 }).day).toBeNull();
    expect(settleBirth({ day: 29, month: 2, year: 2020 }).day).toBe(29);
    expect(settleBirth({ day: 14, month: null, year: null }).day).toBe(14);
  });

  it('saves a complete date, and only that', () => {
    expect(birthDateOf({ day: 14, month: 3, year: 2020 }, TODAY)).toBe(
      '2020-03-14',
    );
    expect(birthDateOf({ day: 5, month: 1, year: 1950 }, TODAY)).toBe(
      '1950-01-05',
    );
    expect(birthDateOf({ day: null, month: 3, year: 2020 }, TODAY)).toBeNull();
    expect(birthDateOf({ day: 14, month: null, year: 2020 }, TODAY)).toBeNull();
    expect(birthDateOf({ day: 14, month: 3, year: null }, TODAY)).toBeNull();
    expect(birthDateOf({ day: 31, month: 4, year: 2020 }, TODAY)).toBeNull();
  });

  it('refuses a date still to come', () => {
    expect(birthDateOf({ day: 19, month: 11, year: 2026 }, TODAY)).toBe(TODAY);
    expect(birthDateOf({ day: 20, month: 11, year: 2026 }, TODAY)).toBeNull();
  });
});

describe('dateOf and partyYears', () => {
  it('gives the ISO day once the three parts exist', () => {
    expect(dateOf({ day: 25, month: 12, year: 2026 })).toBe('2026-12-25');
    expect(dateOf({ day: 29, month: 2, year: 2027 })).toBeNull();
    expect(dateOf({ day: 3, month: null, year: 2026 })).toBeNull();
  });

  it('offers this year and the two after, for a party', () => {
    expect(partyYears(2026)).toEqual([2026, 2027, 2028]);
  });
});
