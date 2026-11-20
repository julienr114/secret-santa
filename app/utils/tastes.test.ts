import { describe, expect, it } from 'vitest';
import { afterOpening, tastesParagraph, type TasteWords } from './tastes';

const words: TasteWords = {
  lately: ['En ce moment, ', '.'],
  wouldHelp: ['Il lui faudrait ', '.'],
  avoid: ['À éviter : ', '.'],
  prefers: ['Côté cadeaux, Léo préfère ', '.'],
  choice: (question, answer) => `${question}-${answer}`,
  sentence: (question, answer) => `${question} ${answer}.`,
  and: 'et',
  lowerFirst: true,
};
const plain = (parts: { text: string }[]) =>
  parts.map((part) => part.text).join('');

describe('afterOpening', () => {
  it('lowers the first letter of a word written with a capital', () => {
    expect(afterOpening('Les dinosaures', true)).toBe('les dinosaures');
  });
  it('keeps a word written in capitals', () => {
    expect(afterOpening('PS5 et manettes', true)).toBe('PS5 et manettes');
  });
  it('keeps the capital where the language wants it', () => {
    expect(afterOpening('Dinosaurier', false)).toBe('Dinosaurier');
  });
  it('puts the text on one line, trimmed', () => {
    expect(afterOpening('  les billes\net  les livres ', true)).toBe(
      'les billes et les livres',
    );
  });
  it('is empty when nothing is written', () => {
    expect(afterOpening('   ', true)).toBe('');
  });
});

describe('tastesParagraph', () => {
  it('says nothing when nothing is written', () => {
    expect(tastesParagraph({}, {}, words)).toEqual([]);
    expect(
      tastesParagraph(
        { lately: ' ', wouldHelp: null },
        { surprise: 'both' },
        words,
      ),
    ).toEqual([]);
  });

  it('sets each text after its opening, what they like in bold', () => {
    const parts = tastesParagraph(
      {
        lately: 'Les dinosaures et les billes',
        wouldHelp: 'un cartable pour le CP',
        avoid: 'les peluches, il en a trop',
      },
      {},
      words,
    );
    expect(plain(parts)).toBe(
      'En ce moment, les dinosaures et les billes. Il lui faudrait un cartable pour le CP. À éviter : les peluches, il en a trop.',
    );
    expect(parts.filter((part) => part.strong)).toEqual([
      { text: 'les dinosaures et les billes', strong: true },
    ]);
  });

  it('leaves out the full stop of a text that ends a sentence', () => {
    expect(plain(tastesParagraph({ avoid: 'les bougies !' }, {}, words))).toBe(
      'À éviter : les bougies !',
    );
    expect(plain(tastesParagraph({ avoid: 'les bougies.' }, {}, words))).toBe(
      'À éviter : les bougies.',
    );
  });

  it('gathers the two-way answers in one sentence, « both » left out', () => {
    expect(
      plain(
        tastesParagraph(
          {},
          {
            usefulOrSurprising: 'first',
            objectOrMoment: 'both',
            keepOrConsume: 'second',
            selfOrShared: 'first',
          },
          words,
        ),
      ),
    ).toBe(
      'Côté cadeaux, Léo préfère usefulOrSurprising-first, keepOrConsume-second et selfOrShared-first.',
    );
    expect(plain(tastesParagraph({}, { objectOrMoment: 'first' }, words))).toBe(
      'Côté cadeaux, Léo préfère objectOrMoment-first.',
    );
  });

  it('ends with the sentences of the two other questions', () => {
    expect(
      plain(
        tastesParagraph(
          { lately: 'la cuisine' },
          { surprise: 'first', secondHand: 'second' },
          words,
        ),
      ),
    ).toBe('En ce moment, la cuisine. secondHand second. surprise first.');
  });
});
