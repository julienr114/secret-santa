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
