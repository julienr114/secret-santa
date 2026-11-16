/**
 * The title of a browser tab: the screen, then where it belongs
 * (« Envoyer par email — Famille Camille · Noël 2026 »), or the app's
 * name when it belongs nowhere or is not known yet.
 * @param screen - The screen's title.
 * @param context - Group, then edition; empty parts are left out.
 * @param appName - The app's name, when there is no context.
 * @returns The tab's title.
 */
export const pageTitle = (
  screen: string,
  context: readonly (string | null | undefined)[],
  appName: string,
): string => {
  const where = context.filter((part): part is string => Boolean(part));
  return `${screen} — ${where.length > 0 ? where.join(' · ') : appName}`;
};
