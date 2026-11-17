import { describe, expect, it } from 'vitest';
import {
  clockTime,
  dayAfter,
  guessEndText,
  instantOf,
  shortDay,
} from './dates';

describe('shortDay', () => {
  const sent = '2026-11-14T10:30:00.000Z';

  it('says the day and the short month in each language', () => {
    expect(shortDay(sent, 'fr')).toBe('14 nov.');
    expect(shortDay(sent, 'en')).toBe('Nov 14');
    expect(shortDay(sent, 'de')).toBe('14. Nov.');
  });

  it('takes a plain day as well as a timestamp', () => {
    expect(shortDay('2026-12-24', 'fr')).toBe('24 déc.');
  });
});

describe('dayAfter', () => {
  it('moves to the next day, month and year', () => {
    expect(dayAfter('2026-12-10')).toBe('2026-12-11');
    expect(dayAfter('2026-11-30')).toBe('2026-12-01');
    expect(dayAfter('2026-12-31')).toBe('2027-01-01');
    expect(dayAfter('2028-02-28')).toBe('2028-02-29');
  });
});

describe('clockTime, guessEndText and instantOf', () => {
  const end = '2026-12-25T17:00:00.000Z';
  it('says the time in each language', () => {
    expect(clockTime(end, 'fr', 'Europe/Paris')).toBe('18 h');
    expect(clockTime('2026-12-25T17:30:00.000Z', 'fr', 'Europe/Paris')).toBe(
      '18 h 30',
    );
    expect(clockTime(end, 'en', 'Europe/Paris')).toBe('6 PM');
    expect(clockTime(end, 'de', 'Europe/Paris')).toBe('18 Uhr');
  });

  it('says the day and the time of the end', () => {
    expect(guessEndText(end, 'fr', 'Europe/Paris')).toBe('25 décembre à 18 h');
    expect(guessEndText(end, 'de', 'Europe/Paris')).toBe(
      '25. Dezember um 18 Uhr',
    );
  });

  it('turns a day and a time in a zone into one instant', () => {
    expect(instantOf('2026-12-25', '18:00', 'Europe/Paris')).toBe(end);
    expect(instantOf('2026-07-14', '18:00', 'Europe/Paris')).toBe(
      '2026-07-14T16:00:00.000Z',
    );
    expect(instantOf('2026-12-25', '18:00', 'UTC')).toBe(
      '2026-12-25T18:00:00.000Z',
    );
  });
});
