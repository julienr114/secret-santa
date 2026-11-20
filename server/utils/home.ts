// « Tirages passés » (README 11), until « Les fêtes passées » replace it
// (ticket 108). The home of the V3 is in shared/utils/homeParties.ts.

/** The closed draws of one year. */
export type PastYear<T> = { year: number; draws: T[] };

/**
 * The closed draws, grouped by year, the latest year first; within a
 * year, by group name.
 * @param draws - The draws of the account, with their year.
 * @returns One entry per year that has some.
 */
export const pastDrawsByYear = <
  T extends { status: string; year: number; groupName: string },
>(
  draws: readonly T[],
): PastYear<T>[] => {
  const past = draws.filter((draw) => draw.status === 'closed');
  return [...new Set(past.map((draw) => draw.year))]
    .toSorted((a, b) => b - a)
    .map((year) => ({
      year,
      draws: past
        .filter((draw) => draw.year === year)
        .toSorted((a, b) => a.groupName.localeCompare(b.groupName)),
    }));
};
