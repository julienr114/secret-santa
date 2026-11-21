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

/** The questions said as « X plutôt que Y » to the giver. */
export const PREFERENCE_QUESTIONS = [
  'usefulOrSurprising',
  'objectOrMoment',
  'keepOrConsume',
  'selfOrShared',
] as const satisfies readonly HintQuestion[];

/** A clear-cut answer. */
export type ClearAnswer = 'first' | 'second';
const clear = (answer: HintAnswer | null): ClearAnswer | null =>
  answer === 'first' || answer === 'second' ? answer : null;

/** What the giver reads of « Moi et les cadeaux », in sentences. */
export type GiverPortrait = {
  /** « {prénom} préfère : », one line per clear-cut answer. */
  prefers: { question: HintQuestion; answer: ClearAnswer }[];
  /** Second hand, a sentence of its own. */
  secondHand: ClearAnswer | null;
  /** Surprise, a sentence of its own, when the question is asked. */
  surprise: ClearAnswer | null;
  /** « Les deux me vont »: one grey line per question. */
  indifferent: HintQuestion[];
};

/**
 * Turns the answers into what the giver reads (decided by Julien on
 * 17 November 2026): the preferences of the first four questions, then
 * second hand and surprise in their own sentences, then the questions
 * where both suit.
 * @param answers - The answers, null where none.
 * @param mode - The group setting.
 * @returns The parts to say, each empty when there is nothing.
 */
export const giverPortrait = (
  answers: HintAnswers,
  mode: GiftHintsMode = 'full',
): GiverPortrait => {
  const asked = questionsFor(mode);
  return {
    prefers: PREFERENCE_QUESTIONS.flatMap((question) => {
      const answer = clear(answers[question]);
      return answer ? [{ question, answer }] : [];
    }),
    secondHand: clear(answers.secondHand),
    surprise: asked.includes('surprise') ? clear(answers.surprise) : null,
    indifferent: asked.filter((question) => answers[question] === 'both'),
  };
};

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
 * The tastes written on a « Moi » card, as a portrait (ticket 107): what
 * the one who drew me reads. Only the known questions, answers and texts.
 * @param card - Its answers and texts, as kept.
 * @param card.answers - The answers, by question.
 * @param card.texts - The texts, by name.
 * @returns The portrait.
 */
export const portraitOfCard = (card: {
  answers: Record<string, string | null> | null;
  texts: Record<string, string | null> | null;
}): Portrait => ({
  answers: Object.fromEntries(
    HINT_QUESTIONS.map((question) => {
      const answer = card.answers?.[question];
      return [question, HINT_ANSWERS.find((known) => known === answer) ?? null];
    }),
  ) as HintAnswers,
  texts: Object.fromEntries(
    HINT_TEXTS.map((text) => {
      const said = card.texts?.[text]?.trim();
      return [text, said ? said : null];
    }),
  ) as HintTexts,
});
