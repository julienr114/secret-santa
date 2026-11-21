import { describe, expect, it } from 'vitest';
import { newSecretSantaDate, newSecretSantaYear } from './newSecretSanta';

describe('newSecretSantaDate', () => {
  it('takes the date of the party this year', () => {
    expect(
      newSecretSantaDate(
        { year: 2026, date: '2026-12-25' },
        '12-25',
        '2026-11-21',
      ),
    ).toBe('2026-12-25');
  });

  it('moves to the next one once the party is past', () => {
    expect(
      newSecretSantaDate(
        { year: 2026, date: '2026-06-12' },
        null,
        '2026-11-21',
      ),
    ).toBe('2027-06-12');
  });

  it('takes the usual day of a party without a year yet', () => {
    expect(newSecretSantaDate(null, '12-25', '2026-11-21')).toBe('2026-12-25');
    expect(newSecretSantaDate(null, '12-25', '2026-12-26')).toBe('2027-12-25');
  });

  it('leaves it to choose when the party has no date', () => {
    expect(
      newSecretSantaDate({ year: 2026, date: null }, null, '2026-11-21'),
    ).toBe('');
    expect(newSecretSantaDate(null, null, '2026-11-21')).toBe('');
  });
});

describe('newSecretSantaYear', () => {
  it('is the year of its day, else the party’s, else this year', () => {
    expect(newSecretSantaYear('2027-06-12', { year: 2026 }, '2026-11-21')).toBe(
      2027,
    );
    expect(newSecretSantaYear('', { year: 2026 }, '2026-11-21')).toBe(2026);
    expect(newSecretSantaYear('', null, '2025-11-21')).toBe(2025);
  });
});
