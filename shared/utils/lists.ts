import { matchesName } from './names';

// Small helpers to show a list in little space. Pure.

/** The first items of a list, and how many are left out. */
export type Stack<T> = { shown: T[]; more: number };

/**
 * Keeps the first `max` items of a list, and counts the others.
 * @param items - The whole list.
 * @param max - How many to show; 4 by default.
 * @returns The items shown and the number left out.
 */
export const stackOf = <T>(items: readonly T[], max = 4): Stack<T> => {
  const limit = Math.max(0, Math.floor(max));
  return {
    shown: items.slice(0, limit),
    more: Math.max(0, items.length - limit),
  };
};

/**
 * How many people a list holds before it folds: up to this, every row
 * shows (validated by Julien on 16 November 2026).
 */
export const FOLD_FROM = 12;

/**
 * A folded list: the first rows, then the others once unfolded (before the
 * "Replier la liste" row), or still behind "Voir les N autres".
 */
export type Fold<T> = { shown: T[]; unfolded: T[]; rest: T[] };

/**
 * Folds a long list: past `from` items, only the first `shown` ones show
 * and the others wait behind a row that unfolds them all at once
 * (decided by Julien on 16 November 2026: never "Voir les N autres" and
 * "Replier la liste" together).
 * @param items - The whole list, in its order.
 * @param shown - How many show while it is folded.
 * @param expanded - The list was unfolded.
 * @param from - The size from which it folds; `FOLD_FROM` by default.
 * @returns The first rows, the unfolded ones, and those still folded.
 */
export const foldList = <T>(
  items: readonly T[],
  shown: number,
  expanded = false,
  from = FOLD_FROM,
): Fold<T> => {
  if (items.length <= from)
    return { shown: [...items], unfolded: [], rest: [] };
  const head = Math.max(0, Math.floor(shown));
  const others = items.slice(head);
  return expanded
    ? { shown: items.slice(0, head), unfolded: others, rest: [] }
    : { shown: items.slice(0, head), unfolded: [], rest: others };
};

/** How a long list of people is looked at right now. */
export type ListLook<T> = {
  /** What is typed in the search field. */
  query: string;
  /** The list was unfolded with "Voir les N autres". */
  expanded: boolean;
  /** How many rows show when it folds. */
  shown: number;
  /** The first name searched in each item. */
  nameOf: (item: T) => string;
  /** The size from which it folds; `FOLD_FROM` by default. */
  from?: number;
};

/**
 * The rows a long list of people shows: every match while searching
 * (never folded), otherwise the list folded or unfolded.
 * @param items - The whole list, in its order.
 * @param look - The search, whether it was unfolded, and how it folds.
 * @returns The first rows, the unfolded ones, and those still folded.
 */
export const listView = <T>(items: readonly T[], look: ListLook<T>): Fold<T> =>
  look.query.trim()
    ? {
        shown: items.filter((item) =>
          matchesName(look.query, look.nameOf(item)),
        ),
        unfolded: [],
        rest: [],
      }
    : foldList(items, look.shown, look.expanded, look.from);
