import { describe, it, expect } from 'vitest';
import {
  EMPTY_PORTRAIT,
  allowsBoth,
  answeredCount,
  hasBothAnswers,
  hasHints,
  isPortraitEmpty,
  nextQuestion,
  portraitTags,
  portraitTexts,
  questionAt,
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

  it('gives a tag for clear-cut answers only, and says when both suit', () => {
    expect(portraitTags(portrait.answers)).toEqual([
      { question: 'usefulOrSurprising', answer: 'first' },
    ]);
    expect(hasBothAnswers(portrait.answers)).toBe(true);
    expect(hasBothAnswers(EMPTY_PORTRAIT.answers)).toBe(false);
    // Without the precise ideas, the surprise question is not asked.
    expect(hasBothAnswers(portrait.answers, 'portrait')).toBe(false);
    expect(
      portraitTags(
        {
          ...EMPTY_PORTRAIT.answers,
          surprise: 'first',
          keepOrConsume: 'second',
        },
        'portrait',
      ),
    ).toEqual([{ question: 'keepOrConsume', answer: 'second' }]);
  });

  it('gives the texts in the order of the page', () => {
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

  it('asks five questions without the precise ideas', () => {
    expect(questionsFor('full')).toHaveLength(6);
    expect(questionsFor('portrait')).not.toContain('surprise');
    expect(questionsFor('portrait')).toHaveLength(5);
    expect(nextQuestion('secondHand', 'portrait')).toBeNull();
    expect(nextQuestion('secondHand', 'full')).toBe('surprise');
    expect(questionAt('6', 'portrait')).toBe('usefulOrSurprising');
  });

  it('has no « Les deux me vont » for second hand', () => {
    expect(allowsBoth('secondHand')).toBe(false);
    expect(allowsBoth('objectOrMoment')).toBe(true);
  });
});
