import fr from './locales/fr';
import en from './locales/en';
import de from './locales/de';
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type Params,
  type Paths,
  type PluralForms,
} from './types';

export { DEFAULT_LOCALE, LOCALES, type Locale, type Params } from './types';

export type Messages = typeof fr;
export type MessageKey = Paths<Messages>;

const DICTIONARIES: Record<Locale, unknown> = { fr, en, de };

export const isLocale = (value: unknown): value is Locale =>
  (LOCALES as readonly unknown[]).includes(value);

/** The given value if it is a supported language, French otherwise. */
export const localeOf = (value: unknown): Locale =>
  isLocale(value) ? value : DEFAULT_LOCALE;

/**
 * Best supported language of an Accept-Language header ("de-CH,de;q=0.9"),
 * French when none matches. Order in the header is trusted over q values.
 */
export const localeFromHeader = (header: string | null | undefined): Locale =>
  (header ?? '')
    .split(',')
    .map((part) => part.trim().slice(0, 2).toLowerCase())
    .find(isLocale) ?? DEFAULT_LOCALE;

const isPlural = (entry: unknown): entry is PluralForms =>
  typeof entry === 'object' &&
  entry !== null &&
  typeof (entry as PluralForms).other === 'string';

const lookup = (locale: Locale, key: string): unknown =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node !== null && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      DICTIONARIES[locale],
    );

const templateOf = (
  locale: Locale,
  key: string,
  count: unknown,
): string | null => {
  const entry = lookup(locale, key);
  if (typeof entry === 'string') return entry;
  if (!isPlural(entry)) return null;
  const one = new Intl.PluralRules(locale).select(Number(count ?? 0)) === 'one';
  return one ? entry.one : entry.other;
};

/** True when the key names a text (used for keys built at run time). */
export const hasMessage = (key: string): boolean =>
  templateOf(DEFAULT_LOCALE, key, 0) !== null;

/**
 * The text of `key` in `locale`, with `{name}` placeholders filled from
 * `params`. A plural text is chosen from `params.count`. A missing key
 * falls back to French, then to the key itself: never an exception.
 */
export const translateKey = (
  locale: Locale,
  key: string,
  params: Params = {},
): string => {
  const template =
    templateOf(locale, key, params.count) ??
    templateOf(DEFAULT_LOCALE, key, params.count);
  return template === null
    ? key
    : template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      );
};

/** Same as translateKey, for keys known at compile time. */
export const translate = (
  locale: Locale,
  key: MessageKey,
  params?: Params,
): string => translateKey(locale, key, params);

export type Translate = (key: MessageKey, params?: Params) => string;

/** A `t` bound to one language, for the pure core. */
export const translator =
  (locale: Locale): Translate =>
  (key, params) =>
    translate(locale, key, params);
