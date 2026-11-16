/**
 * A day in short form, without the year: « 14 nov. », "Nov 14", „14. Nov.“.
 * @param iso - ISO date or timestamp.
 * @param locale - Language of the screen.
 * @returns The day and the shortened month.
 */
export const shortDay = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
    new Date(iso),
  );
