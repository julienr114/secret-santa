import { describe, it, expect } from 'vitest';
import {
  EMPTY_PORTRAIT,
  answeredCount,
  firstUnanswered,
  giverPortrait,
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

  it('gives one tag per answer on the own page, both included', () => {
    expect(portraitTags(portrait.answers)).toEqual([
      { question: 'usefulOrSurprising', answer: 'first' },
      { question: 'surprise', answer: 'both' },
    ]);
    // Without the precise ideas, the surprise question is not asked.
    expect(portraitTags(portrait.answers, 'portrait')).toEqual([
      { question: 'usefulOrSurprising', answer: 'first' },
    ]);
  });

  it('starts the questions at the first one without an answer', () => {
    expect(firstUnanswered(EMPTY_PORTRAIT.answers)).toBe('usefulOrSurprising');
    expect(firstUnanswered(portrait.answers)).toBe('objectOrMoment');
    const allButSurprise = {
      usefulOrSurprising: 'first',
      objectOrMoment: 'first',
      keepOrConsume: 'first',
      selfOrShared: 'first',
      secondHand: 'first',
      surprise: null,
    } as const;
    expect(firstUnanswered(allButSurprise)).toBe('surprise');
    expect(firstUnanswered(allButSurprise, 'portrait')).toBe(
      'usefulOrSurprising',
    );
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
});
