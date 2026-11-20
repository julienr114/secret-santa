// The tastes of a person on a list, as one small paragraph under their
// header (Correction 30, maquettes ListeGroupeFil, ListeGroupeFilDeplie):
// made of what is already written about them, without a new field. Each
// text is set as it was written after a fixed opening, never agreed nor
// rephrased: « En ce moment, **les dinosaures et les billes**. Il lui
// faudrait un cartable pour le CP. À éviter : les peluches. » Then their
// answers to « Moi et les cadeaux », in the sentences the giver already
// reads. Pure.

/** A piece of the paragraph: what they like is in bold. */
export type TastePart = { text: string; strong?: boolean };

/** The words around a text: « En ce moment, » and « . ». */
export type Around = readonly [before: string, after: string];

/** The two-way questions, which make one sentence together. */
export const PREFERENCE_QUESTIONS = [
  'usefulOrSurprising',
  'objectOrMoment',
  'keepOrConsume',
  'selfOrShared',
] as const;
export type PreferenceQuestion = (typeof PREFERENCE_QUESTIONS)[number];
/** The questions that make a sentence of their own. */
export const SENTENCE_QUESTIONS = ['secondHand', 'surprise'] as const;
export type SentenceQuestion = (typeof SENTENCE_QUESTIONS)[number];

/** The words of the paragraph, in the language of the screen. */
export type TasteWords = {
  lately: Around;
  wouldHelp: Around;
  avoid: Around;
  /** « Côté cadeaux, Léo préfère » and « . », around the choices. */
  prefers: Around;
  /** « un objet plutôt qu'un moment ». */
  choice: (question: PreferenceQuestion, answer: 'first' | 'second') => string;
  /** « Léo aime la surprise. » */
  sentence: (question: SentenceQuestion, answer: 'first' | 'second') => string;
  /** « et », between the last two choices. */
  and: string;
  /**
   * Whether a text written with a capital starts in lower case after the
   * opening (French, English); not in German, where nouns keep theirs.
   */
  lowerFirst: boolean;
};

const ENDS_A_SENTENCE = /[.!?…]$/u;

/**
 * A text as it sits after an opening: trimmed, on one line, its first
 * letter in lower case when the language wants it and the word is not
 * written in capitals (« PS5 » stays).
 * @param text - What was written.
 * @param lowerFirst - Whether the language lowers the first letter.
 * @returns The text, empty when nothing was written.
 */
export const afterOpening = (text: string, lowerFirst: boolean): string => {
  const line = text.replace(/\s+/gu, ' ').trim();
  const [first = '', second = ''] = [...line];
  if (!lowerFirst || second !== second.toLowerCase()) return line;
  return first.toLowerCase() + line.slice(first.length);
};

/**
 * One sentence around a text: the closing full stop is left out when the
 * text ends a sentence already.
 * @param around - The words before and after.
 * @param text - The text, ready.
 * @param strong - Whether the text is in bold.
 * @returns The pieces of the sentence.
 */
const sentenceOf = (
  [before, after]: Around,
  text: string,
  strong = false,
): TastePart[] => {
  const closing =
    ENDS_A_SENTENCE.test(text) && after.startsWith('.')
      ? after.slice(1)
      : after;
  return [
    ...(before ? [{ text: before }] : []),
    strong ? { text, strong: true } : { text },
    ...(closing ? [{ text: closing }] : []),
  ];
};

/**
 * Choices as one reads them: « a, b et c ».
 * @param items - The choices.
 * @param and - The word « et ».
 * @returns The choices in one go.
 */
const inOne = (items: readonly string[], and: string): string =>
  items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`;

const isChoice = (answer: string | null | undefined) =>
  answer === 'first' || answer === 'second';

/**
 * The paragraph of a person's tastes: « En ce moment, … », « Il lui
 * faudrait … », « À éviter : … », then « Côté cadeaux, Léo préfère … »
 * and the sentences of the two other questions. An answer « both » says
 * nothing and is left out.
 * @param texts - Their three texts, null where none.
 * @param answers - Their answers, null where none.
 * @param words - The words of the screen's language.
 * @returns The pieces of the paragraph, empty when nothing is written.
 */
export const tastesParagraph = (
  texts: Readonly<Record<string, string | null | undefined>>,
  answers: Readonly<Record<string, string | null | undefined>>,
  words: TasteWords,
): TastePart[] => {
  const text = (key: string) =>
    afterOpening(texts[key] ?? '', words.lowerFirst);
  const lately = text('lately');
  const wouldHelp = text('wouldHelp');
  const avoid = text('avoid');
  const choices = PREFERENCE_QUESTIONS.flatMap((question) => {
    const answer = answers[question];
    return isChoice(answer)
      ? [words.choice(question, answer as 'first' | 'second')]
      : [];
  });
  const sentences: TastePart[][] = [
    ...(lately ? [sentenceOf(words.lately, lately, true)] : []),
    ...(wouldHelp ? [sentenceOf(words.wouldHelp, wouldHelp)] : []),
    ...(avoid ? [sentenceOf(words.avoid, avoid)] : []),
    ...(choices.length > 0
      ? [sentenceOf(words.prefers, inOne(choices, words.and))]
      : []),
    ...SENTENCE_QUESTIONS.flatMap((question) => {
      const answer = answers[question];
      return isChoice(answer)
        ? [[{ text: words.sentence(question, answer as 'first' | 'second') }]]
        : [];
    }),
  ];
  return sentences.flatMap((parts, index) =>
    index === 0 ? parts : [{ text: ' ' }, ...parts],
  );
};
