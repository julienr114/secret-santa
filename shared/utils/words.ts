import type { Locale } from '#shared/i18n';

// Numbers in words, as the palmarès says them (« Cinq sur six »), up to
// twenty; beyond, in figures.

const WORDS: Record<Locale, string[]> = {
  fr: [
    'zéro',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
    'vingt',
  ],
  en: [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
  ],
  de: [
    'null',
    'eins',
    'zwei',
    'drei',
    'vier',
    'fünf',
    'sechs',
    'sieben',
    'acht',
    'neun',
    'zehn',
    'elf',
    'zwölf',
    'dreizehn',
    'vierzehn',
    'fünfzehn',
    'sechzehn',
    'siebzehn',
    'achtzehn',
    'neunzehn',
    'zwanzig',
  ],
};

/**
 * A number in words, up to twenty; in figures beyond.
 * @param n - The number.
 * @param locale - The language.
 * @param capital - Starts with a capital letter.
 * @returns The word.
 */
export const numberWord = (
  n: number,
  locale: Locale,
  capital = false,
): string => {
  const word = WORDS[locale][n] ?? String(n);
  return capital ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word;
};
