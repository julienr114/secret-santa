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

/** How many rows one tap on "Voir les N autres" adds. */
export const FOLD_STEP = 50;

/**
 * A folded list: the first rows, then those already unfolded (after the
 * "Replier la liste" row), then those still behind "Voir les N autres".
 */
export type Fold<T> = { shown: T[]; unfolded: T[]; rest: T[] };

/**
 * Folds a long list: past `from` items, only the first `shown` ones show,
 * then the `opened` ones unfolded so far; the others wait behind a row
 * that unfolds them by `FOLD_STEP`.
 * @param items - The whole list, in its order.
 * @param shown - How many show while it is folded.
 * @param opened - How many rows were unfolded after them; 0 when folded.
 * @param from - The size from which it folds; `FOLD_FROM` by default.
 * @returns The first rows, the unfolded ones, and those still folded.
 */
export const foldList = <T>(
  items: readonly T[],
  shown: number,
  opened = 0,
  from = FOLD_FROM,
): Fold<T> => {
  if (items.length <= from)
    return { shown: [...items], unfolded: [], rest: [] };
  const head = Math.max(0, Math.floor(shown));
  const end = head + Math.max(0, Math.floor(opened));
  return {
    shown: items.slice(0, head),
    unfolded: items.slice(head, end),
    rest: items.slice(end),
  };
};

/** How a long list of people is looked at right now. */
export type ListLook<T> = {
  /** What is typed in the search field. */
  query: string;
  /** How many rows were unfolded with "Voir les N autres"; 0 when folded. */
  opened: number;
  /** How many rows show when it folds. */
  shown: number;
  /** The first name searched in each item. */
  nameOf: (item: T) => string;
  /** The size from which it folds; `FOLD_FROM` by default. */
  from?: number;
};

/**
 * The rows a long list of people shows: every match while searching
 * (never folded), otherwise the list folded as far as it was unfolded.
 * @param items - The whole list, in its order.
 * @param look - The search, how far it was unfolded, and how it folds.
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
    : foldList(items, look.shown, look.opened, look.from);
