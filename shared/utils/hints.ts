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

/** One tag of the result: a question and its answer. */
export type HintTag = { question: HintQuestion; answer: HintAnswer };

/**
 * The tags shown to the giver, in the order of the questions, for the
 * questions answered.
 * @param answers - The answers, null where none.
 * @returns One tag per answer.
 */
export const portraitTags = (answers: HintAnswers): HintTag[] =>
  HINT_QUESTIONS.flatMap((question) => {
    const answer = answers[question];
    return answer ? [{ question, answer }] : [];
  });

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
 * @returns The next one, or null after the last.
 */
export const nextQuestion = (question: HintQuestion): HintQuestion | null =>
  HINT_QUESTIONS[HINT_QUESTIONS.indexOf(question) + 1] ?? null;

/**
 * Reads a question from an address (`?question=2`, from 1 to 6).
 * @param value - The query value.
 * @returns The question, the first one when the value is not a number in
 *   range.
 */
export const questionAt = (value: unknown): HintQuestion => {
  const index = Number(value) - 1;
  return (
    HINT_QUESTIONS[Number.isInteger(index) ? index : 0] ?? 'usefulOrSurprising'
  );
};
