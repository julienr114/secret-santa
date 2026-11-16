import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { foldName, highlightName, matchesName } from './names';

describe('matchesName', () => {
  it('ignores accents and capitals, on both sides', () => {
    expect(matchesName('lo', 'Élodie')).toBe(true);
    expect(matchesName('LO', 'Chloé')).toBe(true);
    expect(matchesName('elo', 'Élodie')).toBe(true);
    expect(matchesName('é', 'Hélène')).toBe(true);
    expect(matchesName('zo', 'Louis')).toBe(false);
  });

  it('matches everyone with an empty query', () => {
    expect(matchesName('', 'Louis')).toBe(true);
    expect(matchesName('  ', 'Louis')).toBe(true);
  });

  it('always finds a name in itself, whatever its case', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        expect(matchesName(name.toUpperCase(), name)).toBe(true);
      }),
    );
  });
});

describe('foldName', () => {
  it('keeps one character per character', () => {
    expect(foldName('Élodie')).toBe('elodie');
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect([...foldName(text)].length).toBe([...text].length);
      }),
    );
  });
});

describe('highlightName', () => {
  it('marks the letters found, in the original spelling', () => {
    expect(highlightName('lo', 'Chloé')).toEqual([
      { text: 'Ch', match: false },
      { text: 'lo', match: true },
      { text: 'é', match: false },
    ]);
    expect(highlightName('elo', 'Élodie')).toEqual([
      { text: 'Élo', match: true },
      { text: 'die', match: false },
    ]);
  });

  it('leaves the name whole when nothing matches', () => {
    expect(highlightName('zz', 'Louis')).toEqual([
      { text: 'Louis', match: false },
    ]);
    expect(highlightName('', 'Louis')).toEqual([
      { text: 'Louis', match: false },
    ]);
  });

  it('never changes the name, only cuts it', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (query, name) => {
        expect(
          highlightName(query, name)
            .map((p) => p.text)
            .join(''),
        ).toBe(name);
      }),
    );
  });
});

describe('a full name', () => {
  it('matches on the last name too, and marks the letters there', () => {
    expect(matchesName('mart', 'Adèle Martin')).toBe(true);
    expect(matchesName('adele ma', 'Adèle Martin')).toBe(true);
    expect(highlightName('MAR', 'Adèle Martin')).toEqual([
      { text: 'Adèle ', match: false },
      { text: 'Mar', match: true },
      { text: 'tin', match: false },
    ]);
  });
});
