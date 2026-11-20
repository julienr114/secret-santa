// The practical details of one of my people, each chosen on its own page
// (Correction 27, README 22.20, 23.3): a date of birth in three lists, a
// shoe size or several in a grid. Pure: the pages only show and save
// what these decide.

// --- Shoe sizes ---------------------------------------------------------

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** The grid: European sizes, no half sizes, in two groups. */
export const SHOE_SIZES = {
  child: range(16, 34),
  adult: range(35, 50),
} as const;
const ALL_SIZES: readonly number[] = [...SHOE_SIZES.child, ...SHOE_SIZES.adult];

/** The words that join two sizes, in the three languages. */
const OR_WORDS = ['ou', 'or', 'oder'];

/**
 * The sizes a saved text says, when it says nothing else: « 30 », « 30
 * ou 31 », « 30, 31 or 32 ». A text written by hand before the grid
 * (« 30,5 », « 30 large ») is not one: it stays as it is until a size is
 * chosen.
 * @param text - What is saved, or nothing.
 * @returns The sizes of the grid, in order; null when the text is
 *   something else; none for nothing saved.
 */
export const shoeSizesOf = (
  text: string | null | undefined,
): number[] | null => {
  const words = (text ?? '')
    .split(/[\s,]+/)
    .filter((word) => word && !OR_WORDS.includes(word.toLowerCase()));
  const sizes = words.map((word) =>
    /^\d{2}$/.test(word) ? Number(word) : NaN,
  );
  return sizes.every((size) => ALL_SIZES.includes(size))
    ? [...new Set(sizes)].toSorted((a, b) => a - b)
    : null;
};

/**
 * One size or several, as they are saved and shown: « 30 », « 30 ou
 * 31 », « 30, 31 ou 32 », in rising order.
 * @param sizes - The sizes chosen.
 * @param or - The word of the language: « ou », « or », « oder ».
 * @returns The text, or null for none.
 */
export const shoeSizesText = (
  sizes: readonly number[],
  or: string,
): string | null => {
  const sorted = [...new Set(sizes)].toSorted((a, b) => a - b);
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return String(sorted[0]);
  return `${sorted.slice(0, -1).join(', ')} ${or} ${sorted.at(-1)}`;
};

/**
 * A saved shoe size as a reader of another language sees it: the sizes
 * of the grid joined by their own word; anything else as it was written.
 * @param text - What is saved.
 * @param or - The word of the reader's language.
 * @returns The text to show, or null for nothing saved.
 */
export const shoeSizesShown = (
  text: string | null | undefined,
  or: string,
): string | null => {
  if (!text) return null;
  const sizes = shoeSizesOf(text);
  return sizes && sizes.length > 0 ? shoeSizesText(sizes, or) : text;
};

/**
 * Ticks a size of the grid, or unticks it.
 * @param sizes - The sizes chosen.
 * @param size - The one touched.
 * @returns The sizes chosen after the touch, in order.
 */
export const toggleShoeSize = (
  sizes: readonly number[],
  size: number,
): number[] =>
  (sizes.includes(size)
    ? sizes.filter((one) => one !== size)
    : [...sizes, size]
  ).toSorted((a, b) => a - b);

// --- Date of birth ------------------------------------------------------

/** How far back the list of years goes. */
export const BIRTH_YEARS_BACK = 110;

/** A date being chosen: each part, or null while it is not. */
export type BirthParts = {
  day: number | null;
  month: number | null;
  year: number | null;
};

/**
 * The years offered, the most recent first.
 * @param thisYear - The current year.
 * @returns From this year back to 110 years ago.
 */
export const birthYears = (thisYear: number): number[] =>
  range(thisYear - BIRTH_YEARS_BACK, thisYear).toReversed();

/**
 * The days a month has: 31 while the month is not chosen; 29 in
 * February while the year is not, so that a 29 February can be said.
 * @param month - The month, 1 to 12, or null.
 * @param year - The year, or null.
 * @returns The number of days to offer.
 */
export const daysIn = (month: number | null, year: number | null): number =>
  month === null ? 31 : new Date(Date.UTC(year ?? 2000, month, 0)).getUTCDate();

/**
 * The parts of a saved date.
 * @param iso - « 2020-03-14 », or nothing.
 * @returns Its day, month and year, or three nulls.
 */
export const birthParts = (iso: string | null | undefined): BirthParts => {
  const [, year, month, day] =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '') ?? [];
  return year
    ? { day: Number(day), month: Number(month), year: Number(year) }
    : { day: null, month: null, year: null };
};

/**
 * The parts after one of them changed: a day the month no longer has
 * (the 31 of April, the 29 of February of a plain year) is left to be
 * chosen again.
 * @param parts - The parts chosen.
 * @returns The same, the day emptied when it no longer exists.
 */
export const settleBirth = (parts: BirthParts): BirthParts =>
  parts.day !== null && parts.day > daysIn(parts.month, parts.year)
    ? { ...parts, day: null }
    : parts;

/**
 * The date to save, once its three parts are chosen. An incomplete date
 * cannot be validated; nor one still to come.
 * @param parts - The parts chosen.
 * @param today - Today, « 2026-11-19 ».
 * @returns « 2020-03-14 », or null.
 */
export const birthDateOf = (
  parts: BirthParts,
  today: string,
): string | null => {
  const iso = dateOf(parts);
  return iso !== null && iso <= today ? iso : null;
};

/**
 * The ISO day of three parts, once all are chosen and the day exists.
 * @param parts - The parts chosen.
 * @returns « 2026-12-25 », or null.
 */
export const dateOf = (parts: BirthParts): string | null => {
  const { day, month, year } = parts;
  if (day === null || month === null || year === null) return null;
  if (day > daysIn(month, year)) return null;
  const pad = (n: number, size: number) => String(n).padStart(size, '0');
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
};

/**
 * The years of a party's date (docs/spec/v3/regles-d-ecran.md): this
 * one, and the two after.
 * @param thisYear - The current year.
 * @returns Three years, the nearest first.
 */
export const partyYears = (thisYear: number): number[] =>
  range(thisYear, thisYear + 2);
