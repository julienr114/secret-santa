import { describe, expect, it } from 'vitest';
import { elide, elideTemplate, startsWithVowelSound } from './elision';

describe('startsWithVowelSound', () => {
  it('is true before a vowel, accented or not, and before an h', () => {
    for (const name of ['Agathe', 'Inès', 'Élise', 'Œdipe', 'Hugo', 'ugo'])
      expect(startsWithVowelSound(name)).toBe(true);
  });

  it('is false before a consonant', () => {
    for (const name of ['Louis', 'Bob', 'Zoé', 'Chloé', ''])
      expect(startsWithVowelSound(name)).toBe(false);
  });

  it('takes a y as a vowel only before a consonant', () => {
    expect(startsWithVowelSound('Yves')).toBe(true);
    expect(startsWithVowelSound('Yann')).toBe(false);
    expect(startsWithVowelSound('Yoann')).toBe(false);
  });
});

describe('elide', () => {
  it('elides « de » and « que », keeping the capital', () => {
    expect(elide('de', 'Agathe')).toBe("d'Agathe");
    expect(elide('de', 'Inès')).toBe("d'Inès");
    expect(elide('de', 'Hugo')).toBe("d'Hugo");
    expect(elide('De', 'Inès')).toBe("D'Inès");
    expect(elide('que', 'Agathe')).toBe("qu'Agathe");
  });

  it('leaves the word apart before a consonant', () => {
    expect(elide('de', 'Louis')).toBe('de Louis');
    expect(elide('que', 'Louis')).toBe('que Louis');
  });
});

describe('elideTemplate', () => {
  it('fills the placeholders that follow « de » or « que »', () => {
    expect(elideTemplate('Le lien de {name}', { name: 'Inès' })).toBe(
      "Le lien d'Inès",
    );
    expect(elideTemplate('Ce que {name} recevra', { name: 'Agathe' })).toBe(
      "Ce qu'Agathe recevra",
    );
    expect(elideTemplate('Le lien de {name}', { name: 'Louis' })).toBe(
      'Le lien de Louis',
    );
  });

  it('leaves alone a « de » inside a word, and the other placeholders', () => {
    expect(elideTemplate('Monde {name}', { name: 'Inès' })).toBe(
      'Monde {name}',
    );
    expect(elideTemplate('À {name} de {other}', { name: 'Inès' })).toBe(
      'À {name} de {other}',
    );
  });
});
