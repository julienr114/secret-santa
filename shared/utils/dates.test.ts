import { describe, expect, it } from 'vitest';
import { shortDay } from './dates';

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
