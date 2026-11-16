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

/** The rows a folded list shows, and those behind "Voir les N autres". */
export type Fold<T> = { shown: T[]; rest: T[] };

/**
 * Folds a long list: past `from` items, only the first `shown` ones show
 * and the others wait behind a row that unfolds them.
 * @param items - The whole list, in its order.
 * @param shown - How many to show when it folds.
 * @param from - The size from which it folds; `FOLD_FROM` by default.
 * @returns The items shown and those folded away.
 */
export const foldList = <T>(
  items: readonly T[],
  shown: number,
  from = FOLD_FROM,
): Fold<T> => {
  if (items.length <= from) return { shown: [...items], rest: [] };
  const limit = Math.max(0, Math.floor(shown));
  return { shown: items.slice(0, limit), rest: items.slice(limit) };
};
