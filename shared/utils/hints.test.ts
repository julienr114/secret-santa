import { describe, it, expect } from 'vitest';
import {
  EMPTY_PORTRAIT,
  answeredCount,
  hasHints,
  isPortraitEmpty,
  nextQuestion,
  portraitTags,
  portraitTexts,
  questionAt,
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

  it('gives the tags and texts in the order of the page', () => {
    expect(portraitTags(portrait.answers)).toEqual([
      { question: 'usefulOrSurprising', answer: 'first' },
      { question: 'surprise', answer: 'both' },
    ]);
    expect(portraitTexts(portrait.texts)).toEqual([
      { key: 'avoid', text: 'Pas de mugs' },
    ]);
  });

  it('walks through the six questions', () => {
    expect(nextQuestion('usefulOrSurprising')).toBe('objectOrMoment');
    expect(nextQuestion('surprise')).toBeNull();
    expect(questionAt('2')).toBe('objectOrMoment');
    expect(questionAt(6)).toBe('surprise');
    expect(questionAt('9')).toBe('usefulOrSurprising');
    expect(questionAt(undefined)).toBe('usefulOrSurprising');
  });
});
