import { describe, expect, it } from 'vitest';
import { boundsOf, checkDate, fullDate } from './dateField';

const parts = (day: number, month: number, year: number) => ({
  day,
  month,
  year,
});

describe('checkDate', () => {
  const event = boundsOf([2026, 2027, 2028]);

  it('takes a date of its years', () => {
    expect(checkDate(parts(14, 12, 2026), event)).toBe('ok');
  });

  it('refuses a year out of its bounds ourselves', () => {
    expect(checkDate(parts(20, 12, 2035), event)).toBe('outside');
    expect(checkDate(parts(20, 12, 2025), event)).toBe('outside');
  });

  it('waits for the three parts', () => {
    expect(checkDate({ day: 14, month: null, year: 2026 }, event)).toBe(
      'empty',
    );
  });

  it('refuses a birth still to come', () => {
    const birth = boundsOf([2026, 2025, 1916], '2026-11-25');
    expect(checkDate(parts(14, 3, 2020), birth)).toBe('ok');
    expect(checkDate(parts(26, 11, 2026), birth)).toBe('future');
  });
});

describe('fullDate', () => {
  it('says the date in full, with its day for an event', () => {
    expect(fullDate('2026-12-14', 'fr', true)).toBe('lundi 14 décembre 2026');
    expect(fullDate('2020-03-14', 'fr', false)).toBe('14 mars 2020');
    expect(fullDate('2026-12-14', 'de', true)).toBe(
      'Montag, 14. Dezember 2026',
    );
  });
});

describe('a date from today on (Julien, 25 November 2026)', () => {
  it('refuses a Secret Santa in the past, takes today', () => {
    const santa = boundsOf([2026, 2027, 2028], undefined, '2026-11-25');
    expect(checkDate(parts(11, 2, 2026), santa)).toBe('past');
    expect(checkDate(parts(25, 11, 2026), santa)).toBe('ok');
  });
});
