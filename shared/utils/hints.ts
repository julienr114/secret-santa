// Gift hints (README 22.11): what a participant tells the person who gives
// them a present. Shared by the server and the screens. Pure.

/**
 * The six questions of « Moi et les cadeaux », in the order they are asked.
 * Each one has two choices, plus « Les deux me vont ».
 */
export const HINT_QUESTIONS = [
  'usefulOrSurprising',
  'objectOrMoment',
  'keepOrConsume',
  'selfOrShared',
  'secondHand',
  'surprise',
] as const;
export type HintQuestion = (typeof HINT_QUESTIONS)[number];

/**
 * An answer is a fixed value per question, never text (README 22.11: so
 * that they can be counted one day): the first choice, the second one, or
 * both. No answer is null.
 */
export const HINT_ANSWERS = ['first', 'second', 'both'] as const;
export type HintAnswer = (typeof HINT_ANSWERS)[number];
export type HintAnswers = Record<HintQuestion, HintAnswer | null>;

/** The three free texts, 300 characters each. */
export const HINT_TEXTS = ['lately', 'wouldHelp', 'avoid'] as const;
export type HintText = (typeof HINT_TEXTS)[number];
export type HintTexts = Record<HintText, string | null>;
export const HINT_TEXT_MAX = 300;

/** Everything but the precise ideas, which keep their own list. */
export type Portrait = { answers: HintAnswers; texts: HintTexts };

/**
 * The group setting: the portrait and precise ideas, the portrait only (no
 * object idea, the surprise stays whole), or no hint at all.
 */
export const GIFT_HINTS_MODES = ['full', 'portrait', 'none'] as const;
export type GiftHintsMode = (typeof GIFT_HINTS_MODES)[number];

const fromKeys = <K extends string, V>(keys: readonly K[], value: V) =>
  Object.fromEntries(keys.map((key) => [key, value])) as Record<K, V>;

/** A portrait with nothing in it. */
export const EMPTY_PORTRAIT: Readonly<Portrait> = Object.freeze({
  answers: fromKeys(HINT_QUESTIONS, null),
  texts: fromKeys(HINT_TEXTS, null),
});

/**
 * How many of the six questions have an answer.
 * @param answers - The answers, null where none.
 * @returns From 0 to 6.
 */
export const answeredCount = (answers: HintAnswers): number =>
  HINT_QUESTIONS.filter((question) => answers[question] !== null).length;

/**
 * Whether a portrait holds nothing: no answer and no text.
 * @param portrait - The answers and the texts.
 * @returns True when it is empty.
 */
export const isPortraitEmpty = (portrait: Portrait): boolean =>
  answeredCount(portrait.answers) === 0 &&
  HINT_TEXTS.every((key) => !portrait.texts[key]);

/**
 * Whether someone left hints: a question answered, a text, or a precise
 * idea. What the organiser sees, and what turns « Lui demander des
 * pistes » off.
 * @param portrait - The answers and the texts.
 * @param ideasCount - How many precise ideas they wrote.
 * @returns True when there is something to read.
 */
export const hasHints = (portrait: Portrait, ideasCount: number): boolean =>
  ideasCount > 0 || !isPortraitEmpty(portrait);

/**
 * The questions asked under a setting: all six with the precise ideas;
 * without them (`portrait`), not « Surprends-moi, ou je préfère savoir ? »,
 * whose second choice points to an idea below (decided by Julien on
 * 17 November 2026).
 * @param mode - The group setting.
 * @returns The questions, in their order.
 */
export const questionsFor = (mode: GiftHintsMode): readonly HintQuestion[] =>
  mode === 'portrait'
    ? HINT_QUESTIONS.filter((question) => question !== 'surprise')
    : HINT_QUESTIONS;

/**
 * Whether a question offers « Les deux me vont »: all but « D'occasion ou
 * fait main », which is a yes or a no.
 * @param question - The question.
 * @returns True when both is a possible answer.
 */
export const allowsBoth = (question: HintQuestion): boolean =>
  question !== 'secondHand';

/** One tag of the result: a question and its clear-cut answer. */
export type HintTag = { question: HintQuestion; answer: 'first' | 'second' };

/**
 * The tags shown, in the order of the questions asked: only the clear-cut
 * answers; « Les deux me vont » makes no tag.
 * @param answers - The answers, null where none.
 * @param mode - The group setting: a question not asked shows nothing.
 * @returns One tag per clear-cut answer.
 */
export const portraitTags = (
  answers: HintAnswers,
  mode: GiftHintsMode = 'full',
): HintTag[] =>
  questionsFor(mode).flatMap((question) => {
    const answer = answers[question];
    return answer === 'first' || answer === 'second'
      ? [{ question, answer }]
      : [];
  });

/**
 * Whether some question asked was answered « Les deux me vont »: then one
 * discreet line under the tags says so.
 * @param answers - The answers, null where none.
 * @param mode - The group setting.
 * @returns True when at least one answer is both.
 */
export const hasBothAnswers = (
  answers: HintAnswers,
  mode: GiftHintsMode = 'full',
): boolean =>
  questionsFor(mode).some((question) => answers[question] === 'both');

/**
 * The text blocks shown to the giver, in their order, the empty ones left
 * out.
 * @param texts - The three texts, null where empty.
 * @returns The keys and texts to show.
 */
export const portraitTexts = (
  texts: HintTexts,
): { key: HintText; text: string }[] =>
  HINT_TEXTS.flatMap((key) => {
    const text = texts[key];
    return text ? [{ key, text }] : [];
  });

/**
 * Which question comes after one, in the flow of « Moi et les cadeaux ».
 * @param question - The question just answered.
 * @param mode - The group setting.
 * @returns The next one, or null after the last.
 */
export const nextQuestion = (
  question: HintQuestion,
  mode: GiftHintsMode = 'full',
): HintQuestion | null => {
  const asked = questionsFor(mode);
  return asked[asked.indexOf(question) + 1] ?? null;
};

/**
 * Reads a question from an address (`?n=2`, from 1 to the number asked).
 * @param value - The query value.
 * @param mode - The group setting.
 * @returns The question, the first one when the value is not a number in
 *   range.
 */
export const questionAt = (
  value: unknown,
  mode: GiftHintsMode = 'full',
): HintQuestion => {
  const asked = questionsFor(mode);
  const index = Number(value) - 1;
  return asked[Number.isInteger(index) ? index : 0] ?? 'usefulOrSurprising';
};
