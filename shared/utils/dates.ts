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

/**
 * The day after a day.
 * @param day - ISO day, `YYYY-MM-DD`.
 * @returns The next ISO day, across months and years.
 */
export const dayAfter = (day: string): string =>
  new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000)
    .toISOString()
    .slice(0, 10);

/**
 * The time of an instant in the way of each language: « 18 h », « 18 h 30 »,
 * "6 PM", "6:30 PM", „18 Uhr“, „18:30 Uhr“.
 * @param iso - The instant.
 * @param locale - The language.
 * @param timeZone - Where it is read (the browser's, or the one chosen).
 * @returns The time.
 */
export const clockTime = (
  iso: string,
  locale: string,
  timeZone?: string,
): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const lang = locale.slice(0, 2);
  if (lang === 'fr')
    return minute === '00' ? `${hour} h` : `${hour} h ${minute}`;
  if (lang === 'de') {
    return minute === '00' ? `${hour} Uhr` : `${hour}:${minute} Uhr`;
  }
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  const half = hour < 12 ? 'AM' : 'PM';
  return minute === '00' ? `${twelve} ${half}` : `${twelve}:${minute} ${half}`;
};

/**
 * When the guesses of « Devine qui » end, in words: « 25 décembre à
 * 18 h », "December 25 at 6 PM", „25. Dezember um 18 Uhr“.
 * @param iso - The end (instant).
 * @param locale - The language.
 * @param timeZone - Where it is read.
 * @returns The day and the time.
 */
export const guessEndText = (
  iso: string,
  locale: string,
  timeZone?: string,
): string => {
  const day = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(new Date(iso));
  const at = { fr: 'à', de: 'um' }[locale.slice(0, 2)] ?? 'at';
  return `${day} ${at} ${clockTime(iso, locale, timeZone)}`;
};

/**
 * The instant of a day and a time read in a time zone: what the
 * organiser picks in « Devine qui » becomes one instant for everyone.
 * @param day - ISO day.
 * @param time - `HH:MM`.
 * @param timeZone - The organiser's.
 * @returns The instant (ISO).
 */
export const instantOf = (day: string, time: string, timeZone: string) => {
  const asUtc = Date.parse(`${day}T${time}:00Z`);
  // How far the zone is from UTC at that moment, read back from Intl.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(asUtc))
      .map((p) => [p.type, p.value]),
  );
  const seen = Date.parse(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`,
  );
  return new Date(asUtc - (seen - asUtc)).toISOString();
};
