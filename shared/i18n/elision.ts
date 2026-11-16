// French elision (decided on 17 November 2026): « de » and « que » lose
// their vowel before a word that starts with one, or with an h: « le lien
// d'Inès », « d'Hugo », « ce qu'Agathe recevra ». Pure.

/** The French words that elide, and what they become. */
const ELIDED: Record<string, string> = {
  de: "d'",
  De: "D'",
  que: "qu'",
  Que: "Qu'",
};

/**
 * Whether a French word takes an elision before it: it starts with a
 * vowel or an h (every h, as « d'Hugo »), or with a y followed by a
 * consonant (« d'Yves », but « de Yann »).
 * @param word - The word that follows.
 * @returns True when « de » becomes « d' » before it.
 */
export const startsWithVowelSound = (word: string): boolean => {
  const folded = word
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (/^[aeiouhœæ]/.test(folded)) return true;
  return /^y[^aeiouy]/.test(folded);
};

/**
 * « de » or « que » followed by a word, elided when it should be.
 * @param small - « de », « que », or the same with a capital.
 * @param word - The word that follows, a first name most often.
 * @returns « d'Inès », « de Louis », « qu'Agathe »…
 */
export const elide = (small: string, word: string): string => {
  const short = ELIDED[small];
  return short && startsWithVowelSound(word)
    ? `${short}${word}`
    : `${small} ${word}`;
};

/** « de {x} » or « que {x} » in a template, after a word boundary. */
const BEFORE_PLACEHOLDER = /(^|[^\p{L}])(de|De|que|Que) \{(\w+)\}/gu;

/**
 * Fills the placeholders of a French template that follow « de » or
 * « que », eliding where their value asks for it; the others are left for
 * the usual filling.
 * @param template - A French text with `{name}` placeholders.
 * @param params - The values of the placeholders.
 * @returns The template, those placeholders filled.
 */
export const elideTemplate = (
  template: string,
  params: Record<string, unknown>,
): string =>
  template.replace(
    BEFORE_PLACEHOLDER,
    (match, before: string, small: string, name: string) =>
      name in params ? `${before}${elide(small, String(params[name]))}` : match,
  );
