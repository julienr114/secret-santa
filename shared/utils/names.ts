// Finding a name (a first name, or a first and last name) by a few letters, the way people type them:
// accents and capitals do not matter. Pure.

/**
 * A text without accents nor capitals, one character per character of
 * the original, so that positions found in it hold in the original.
 * @param text - Any text.
 * @returns The folded text.
 */
export const foldName = (text: string): string =>
  [...text]
    .map((char) => char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase())
    .map((char) => (char.length === 1 ? char : char.charAt(0) || ' '))
    .join('');

/**
 * Whether a first name contains what was typed, accents and capitals
 * ignored. An empty query matches everyone.
 * @param query - What was typed.
 * @param firstName - The name to look in.
 * @returns True when it matches.
 */
export const matchesName = (query: string, firstName: string): boolean =>
  foldName(firstName).includes(foldName(query.trim()));

/** A piece of a name, marked when it is the part that matched. */
export type NamePart = { text: string; match: boolean };

/**
 * Cuts a name around the first place it matches the query, to show the
 * letters found.
 * @param query - What was typed.
 * @param firstName - The name.
 * @returns The pieces, in order; the whole name unmarked when nothing
 *   matches or the query is empty.
 */
export const highlightName = (query: string, firstName: string): NamePart[] => {
  const needle = foldName(query.trim());
  const start = needle ? foldName(firstName).indexOf(needle) : -1;
  if (start < 0) return [{ text: firstName, match: false }];
  const chars = [...firstName];
  const end = start + [...needle].length;
  return [
    { text: chars.slice(0, start).join(''), match: false },
    { text: chars.slice(start, end).join(''), match: true },
    { text: chars.slice(end).join(''), match: false },
  ].filter((part) => part.text.length > 0);
};
