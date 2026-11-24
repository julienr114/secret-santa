// The page « Budget » of a Secret Santa (docs/spec/v3/secret-santa.md,
// « Le créer », ticket 164): five amounts well apart and « Sans limite »,
// or a text of one's own. The budget stays a text. Pure.

/** The amounts of the tiles, in euros; the sixth tile is « Sans limite ». */
export const BUDGET_AMOUNTS = [5, 15, 30, 50, 75] as const;

/** What the page has chosen: a tile, or the line « À ta façon ». */
export type BudgetPick = { tile: number | null; free: string };

/**
 * What a budget already written chooses when the page opens: the tile
 * whose text it is exactly, else the line « À ta façon », as it is.
 * @param budget - The budget saved.
 * @param tiles - The texts the tiles save, in their order.
 * @returns The tile, or the line.
 */
export const budgetPick = (
  budget: string,
  tiles: readonly string[],
): BudgetPick => {
  const text = budget.trim();
  const at = text === '' ? -1 : tiles.indexOf(text);
  return at >= 0 ? { tile: at, free: '' } : { tile: null, free: text };
};

/**
 * The budget a choice saves: the text of its tile, or the line; nothing
 * chosen and the line empty, no budget.
 * @param pick - The choice.
 * @param tiles - The texts the tiles save, in their order.
 * @returns The budget, maybe empty.
 */
export const budgetOf = (pick: BudgetPick, tiles: readonly string[]) =>
  pick.tile === null ? pick.free.trim() : (tiles[pick.tile] ?? '');
