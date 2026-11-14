/** A draw opened from the home page: its personal page. */
export type DrawFromHome = { path: string };

/**
 * Remembers which draw was opened from the home page, for the time of the
 * visit. Its pages then show the way back home; opened from the link
 * itself, or after a reload, they do not.
 * @returns The shared state, null when no draw was opened from home.
 */
export const useDrawFromHome = () =>
  useState<DrawFromHome | null>('draw-from-home', () => null);
