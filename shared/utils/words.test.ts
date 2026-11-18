import { describe, expect, it } from 'vitest';
import { numberWord } from './words';

describe('numberWord', () => {
  it('writes up to twenty in words, then in figures', () => {
    expect(numberWord(5, 'fr', true)).toBe('Cinq');
    expect(numberWord(17, 'fr')).toBe('dix-sept');
    expect(numberWord(4, 'en')).toBe('four');
    expect(numberWord(12, 'de')).toBe('zwölf');
    expect(numberWord(21, 'fr')).toBe('21');
  });
});
