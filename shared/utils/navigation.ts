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

/** The pages of a group, moved to its party (ticket 104). */
const MOVED = {
  personnes: 'membres',
  invitation: 'invitation',
  reglages: 'reglages',
  organisateurs: 'organisateurs',
  exclusions: 'exclusions',
  journal: 'journal',
} as const;

/** What under /admin is not a group. */
const NOT_A_GROUP = ['comptes', 'demandes', 'groupes', 'guide-de-style'];

/**
 * Where an old address leads now: the page of a group to its event
 * (docs/spec/v3/fete.md, ticket 104), and `/f/…`, the address of an event
 * until ticket 102, to `/e/…` (docs/spec/v3/vocabulaire.md). The editions
 * stay under /admin.
 * @param path - The path asked for.
 * @returns The new path, or null when it did not move.
 */
export const partyPathOf = (path: string): string | null => {
  if (path === '/f' || path.startsWith('/f/')) return `/e${path.slice(2)}`;
  const [, first, slug, page, ...rest] = path.split('/');
  if (first !== 'admin' || !slug || NOT_A_GROUP.includes(slug)) return null;
  if (page === undefined || page === '') return `/e/${slug}`;
  const moved = MOVED[page as keyof typeof MOVED];
  return moved ? ['', 'e', slug, moved, ...rest].join('/') : null;
};

/** The tabs of the bar at the bottom (docs/spec/v3/accueil-et-creation.md). */
export type Tab = 'home' | 'news' | 'admin';

/** The pages of the super-admin; the editions of a group are under /admin too. */
const ADMIN_PAGES = NOT_A_GROUP.map((page) => `/admin/${page}`);

/**
 * The tab a screen belongs to: « Quoi de neuf » and « Admin » own their
 * pages, every other screen is under « Accueil », a group's pages
 * included. « Créer » only opens a sheet, and is never the current one.
 * @param path - The path of the screen.
 * @returns The tab shown in colour.
 */
export const tabOf = (path: string): Tab => {
  const under = (start: string) =>
    path === start || path.startsWith(`${start}/`);
  if (under('/quoi-de-neuf')) return 'news';
  return path === '/admin' || ADMIN_PAGES.some(under) ? 'admin' : 'home';
};
