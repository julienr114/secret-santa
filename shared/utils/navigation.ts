// « Retour » goes up the tree of pages, never simply back in the browser's
// history (decided by Julien on 18 November 2026): every screen names its
// parent (docs/ARBORESCENCE.md). When the page before in the history is
// that parent, going back keeps the history tidy; otherwise the parent
// opens.

/**
 * How « Retour » reaches the parent of a screen.
 * @param previous - The page before in the browser's history, if known.
 * @param parent - The parent of the screen in the tree (path and query).
 * @returns `history` to go back, `navigate` to open the parent.
 */
export const backMove = (
  previous: string | null | undefined,
  parent: string,
): 'history' | 'navigate' => (previous === parent ? 'history' : 'navigate');
