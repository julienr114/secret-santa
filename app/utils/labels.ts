import type { Locale } from '#shared/i18n';

// Formatting helpers. Labels themselves live in shared/i18n
// (`common.status.*`, `common.messageType.*`, `common.count.*`).

/**
 * A day, without the time: "14 novembre".
 * @param iso - ISO date.
 * @param locale - Language of the screen.
 * @returns The day and month, in words.
 */
export const formatDay = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(
    new Date(iso),
  );

/**
 * A day in short, on the header of a party's card: « 19 déc. ».
 * @param iso - « 2026-12-19 ».
 * @param locale - Language of the screen.
 * @returns The day and the short month.
 */
export const formatShortDay = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
