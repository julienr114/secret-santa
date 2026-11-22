/** The two bars of a loading line (its title, its subtitle), by width. */
export type SkeletonLine = readonly [title: string, subtitle: string];

/**
 * The widths the loading lines take in turn (V3ChargementAccueil,
 * V3ChargementFete), so a list of them does not look like a ruler.
 */
export const SKELETON_LINES: readonly SkeletonLine[] = [
  ['55%', '38%'],
  ['62%', '30%'],
  ['45%', '44%'],
  ['48%', '40%'],
];

/**
 * The widths of `count` loading lines, taken in turn from `from`.
 * @param count - How many lines.
 * @param from - Which of the widths the first line takes.
 * @returns One pair of widths per line.
 */
export const skeletonLines = (count: number, from = 0): SkeletonLine[] =>
  Array.from(
    { length: Math.max(0, count) },
    (_, index) =>
      SKELETON_LINES[(from + index) % SKELETON_LINES.length] ??
      SKELETON_LINES[0]!,
  );
