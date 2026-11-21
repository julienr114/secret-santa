import { describe, it, expect } from 'vitest';
import {
  EMPTY_PORTRAIT,
  answeredCount,
  giverPortrait,
  hasHints,
  isPortraitEmpty,
  portraitOfCard,
  portraitTexts,
  questionsFor,
  type Portrait,
} from './hints';

const portrait: Portrait = {
  answers: {
    ...EMPTY_PORTRAIT.answers,
    usefulOrSurprising: 'first',
    surprise: 'both',
  },
  texts: { ...EMPTY_PORTRAIT.texts, avoid: 'Pas de mugs' },
};

describe('hints', () => {
  it('counts answers and knows an empty portrait', () => {
    expect(answeredCount(EMPTY_PORTRAIT.answers)).toBe(0);
    expect(answeredCount(portrait.answers)).toBe(2);
    expect(isPortraitEmpty(EMPTY_PORTRAIT)).toBe(true);
    expect(isPortraitEmpty(portrait)).toBe(false);
    expect(
      isPortraitEmpty({
        ...EMPTY_PORTRAIT,
        texts: { ...EMPTY_PORTRAIT.texts, lately: 'Le vélo' },
      }),
    ).toBe(false);
  });

  it('has hints with an answer, a text or a precise idea', () => {
    expect(hasHints(EMPTY_PORTRAIT, 0)).toBe(false);
    expect(hasHints(EMPTY_PORTRAIT, 1)).toBe(true);
    expect(hasHints(portrait, 0)).toBe(true);
  });

  it('says the answers to the giver in sentences', () => {
    const answers = {
      usefulOrSurprising: 'first',
      objectOrMoment: 'second',
      keepOrConsume: null,
      selfOrShared: 'both',
      secondHand: 'second',
      surprise: 'first',
    } as const;
    expect(giverPortrait(answers)).toEqual({
      prefers: [
        { question: 'usefulOrSurprising', answer: 'first' },
        { question: 'objectOrMoment', answer: 'second' },
      ],
      secondHand: 'second',
      surprise: 'first',
      indifferent: ['selfOrShared'],
    });
    // « Neuf, ou d'occasion ? » takes « Les deux me vont » too.
    expect(
      giverPortrait({ ...answers, secondHand: 'both' }).indifferent,
    ).toEqual(['selfOrShared', 'secondHand']);
    expect(giverPortrait({ ...answers, surprise: 'both' }, 'portrait')).toEqual(
      {
        prefers: [
          { question: 'usefulOrSurprising', answer: 'first' },
          { question: 'objectOrMoment', answer: 'second' },
        ],
        secondHand: 'second',
        surprise: null,
        indifferent: ['selfOrShared'],
      },
    );
    expect(giverPortrait(EMPTY_PORTRAIT.answers)).toEqual({
      prefers: [],
      secondHand: null,
      surprise: null,
      indifferent: [],
    });
  });

  it('gives the texts in the order of the page', () => {
    expect(portraitTexts(portrait.texts)).toEqual([
      { key: 'avoid', text: 'Pas de mugs' },
    ]);
  });

  it('asks five questions without the precise ideas', () => {
    expect(questionsFor('full')).toHaveLength(6);
    expect(questionsFor('portrait')).not.toContain('surprise');
    expect(questionsFor('portrait')).toHaveLength(5);
  });
});

describe('portraitOfCard', () => {
  it('reads the known answers and texts of a « Moi » card, nothing else', () => {
    const portrait = portraitOfCard({
      answers: { usefulOrSurprising: 'first', unknown: 'first', surprise: 'x' },
      texts: { lately: '  La course à pied ', avoid: '   ', other: 'non' },
    });
    expect(portrait.answers.usefulOrSurprising).toBe('first');
    expect(portrait.answers.surprise).toBeNull();
    expect(Object.keys(portrait.answers)).not.toContain('unknown');
    expect(portrait.texts).toEqual({
      lately: 'La course à pied',
      wouldHelp: null,
      avoid: null,
    });
  });

  it('is empty for a card never written', () => {
    expect(hasHints(portraitOfCard({ answers: null, texts: null }), 0)).toBe(
      false,
    );
  });
});
