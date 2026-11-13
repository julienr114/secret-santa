// Translations (plan v7): French, English and German. One typed
// dictionary per language, shared by the server (messages, emails,
// journal) and the screens. French is the reference: the other languages
// must have exactly the same keys, which the compiler checks.

export const LOCALES = ['fr', 'en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

/** A text that depends on a count: picked with Intl.PluralRules. */
export type PluralForms = { one: string; other: string };

/** The shape another language must have to match the reference `T`. */
export type Dict<T> = T extends string
  ? string
  : T extends PluralForms
    ? PluralForms
    : { [K in keyof T]: Dict<T[K]> };

/** Dot paths to every text of a dictionary: `common.actions.back`. */
export type Paths<T> = {
  [K in keyof T & string]: T[K] extends string | PluralForms
    ? K
    : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type Params = Record<string, string | number>;
