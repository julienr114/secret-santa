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
  // An event has no invitation link any more (ticket 116).
  if (page === 'invitation') return `/e/${slug}/membres`;
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

/**
 * Where the old addresses of the gift hints lead (ticket 107,
 * docs/spec/v3/navigation.md, « Les anciennes adresses »): « Mes pistes »
 * and its pages, and « Mes souhaits » before it, to my list from my
 * Secret Santa.
 * @param path - The path asked for.
 * @returns The new path, or null when it did not move.
 */
export const hintsPathOf = (path: string): string | null => {
  const match = /^\/p\/([^/]+)\/(pistes|souhaits)(\/.*)?$/.exec(path);
  return match ? `/p/${match[1]}/liste` : null;
};

/**
 * Where « Tirages passés » leads now (ticket 108, docs/spec/v3/navigation.md,
 * « Les anciennes adresses »): « Les événements passés ».
 * @param path - The path asked for.
 * @returns The new path, or null when it did not move.
 */
export const pastPathOf = (path: string): string | null =>
  path === '/tirages-passes' || path === '/tirages-passes/'
    ? '/evenements-passes'
    : null;

/**
 * Where `/listes`, the page of the old tab « Listes », leads now
 * (docs/spec/v3/navigation.md, « Les anciennes adresses »): the home.
 * Its lists (`/listes/[id]`, `/listes/nouvelle`) stay.
 * @param path - The path asked for.
 * @returns The new path, or null when it did not move.
 */
export const listsPathOf = (path: string): string | null =>
  path === '/listes' || path === '/listes/' ? '/' : null;

/**
 * Where the pages of the V2 that nothing replaces lead (ticket 113, « une
 * ancienne adresse ne donne jamais une page d'erreur »): asking to organise
 * (`/demande`) to the home, the requests of the super-admin
 * (`/admin/demandes`, ticket 105) to the administration, and the word of
 * a group's settings (`/admin/[groupe]/reglages/mot`, moved by
 * `partyPathOf`) to the settings of its event; « Inviter quelqu'un » and
 * the message of a list's link to the list (ticket 139: it is in the bar
 * now, or gone).
 * @param path - The path asked for.
 * @returns The new path, or null when it did not move.
 */
export const gonePathOf = (path: string): string | null => {
  if (/^\/demande\/?$/.test(path)) return '/';
  const list = /^\/listes\/([^/]+)\/(?:inviter(?:\/.*)?|message\/?)$/.exec(
    path,
  );
  if (list) return `/listes/${list[1]}`;
  if (/^\/admin\/demandes(\/.*)?$/.test(path)) return '/admin';
  const word = /^\/e\/([^/]+)\/reglages\/mot\/?$/.exec(path);
  return word ? `/e/${word[1]}/reglages` : null;
};

/**
 * Where the invitation link of an event and its page lead now that an
 * event has none (ticket 116, docs/spec/v3/navigation.md, « Les anciennes
 * adresses »): to its « Membres ». The link of a Secret Santa is under it.
 * « Nouvelle personne » goes there too: nobody is added to an event
 * itself (ticket 117).
 * @param path - The path asked for.
 * @returns The new path, or null when it did not move.
 */
export const invitationPathOf = (path: string): string | null => {
  const match =
    /^\/e\/([^/]+)\/(?:invitation(?:\/.*)?|membres\/nouvelle\/?)$/.exec(path);
  return match ? `/e/${match[1]}/membres` : null;
};

/** The pages « Retour » can lead back to, when a page has several parents. */
export type Place =
  | 'home'
  | 'news'
  | 'elsewhere'
  | 'past'
  | 'event'
  | 'year'
  | 'list'
  | 'draw'
  | 'people';

/** Each place, by the shape of its path (without its query). */
const PLACES: readonly (readonly [Place, RegExp])[] = [
  ['home', /^\/$/],
  ['news', /^\/quoi-de-neuf$/],
  ['elsewhere', /^\/offert-ailleurs$/],
  ['past', /^\/evenements-passes$/],
  ['event', /^\/e\/(?!nouvelle$)[^/]+$/],
  ['year', /^\/e\/[^/]+\/annees\/[^/]+$/],
  ['list', /^\/(listes\/(?!nouvelle$)|l\/)[^/]+$/],
  ['draw', /^\/p\/[^/]+$/],
  ['people', /^\/famille$/],
];

/**
 * Which of the places a page is, read from its address.
 * @param fullPath - The path, with its query.
 * @returns The place, or null for any other page.
 */
export const placeOf = (fullPath: string): Place | null => {
  const path = fullPath.split(/[?#]/)[0] ?? '';
  return PLACES.find(([, shape]) => shape.test(path))?.[0] ?? null;
};

/** The pages with several parents (docs/spec/v3/navigation.md). */
export type Page =
  'event' | 'list' | 'draw' | 'edition' | 'people' | 'person' | 'year';

/**
 * The parents of each page with several, line by line as the table of
 * docs/spec/v3/navigation.md (« Retour », quand une page a plusieurs
 * parents). Its default parent depends on the page: the caller gives it.
 */
export const PARENTS: Record<Page, readonly Place[]> = {
  event: ['home', 'news'],
  list: ['home', 'event', 'news', 'elsewhere', 'year'],
  draw: ['home', 'event', 'news', 'year'],
  edition: ['home', 'event', 'news'],
  people: ['list'],
  person: ['list', 'draw', 'people'],
  year: ['past', 'event'],
};

/**
 * Where « Retour » leads from a page with several parents: the one I come
 * from, when it is one of them; back from one of its own pages (a list's
 * holders, a person's tastes), the parent I came from first, remembered
 * for the visit; otherwise (an email, a link, an address typed, the page
 * reloaded, a page that is not its parent) the default one. Only a page
 * I have just seen can be remembered: « Retour » never opens one I may
 * not see.
 * @param page - The page.
 * @param previous - The page before in the history, if any.
 * @param remembered - The parent remembered for this page, if any.
 * @param fallback - Its default parent.
 * @returns The path of the parent, with its query.
 */
export const parentOf = (
  page: Page,
  previous: string | null | undefined,
  remembered: string | null | undefined,
  fallback: string,
): string => {
  if (!previous) return fallback;
  const place = placeOf(previous);
  if (place === null) return remembered ?? fallback;
  return PARENTS[page].includes(place) ? previous : fallback;
};

/**
 * The levels of the bar of a list (tickets 139, 141): « Quelqu'un
 * d'autre », « Reprendre ceux de » past it, and a question before a step
 * (« Retirer « Chez Mamie » ? », « Ouvrir à tout le monde ? », « Changer
 * de lien ? »), each one further than the first.
 */
export const SHARE_LEVELS = ['', 'inviter', 'reprendre', 'confirmer'] as const;
export type ShareLevel = (typeof SHARE_LEVELS)[number];

/**
 * The level of the bar of a list an address asks for (`?partage=`): the
 * first one when it says none, or one that does not exist.
 * @param value - The value of `partage`.
 * @returns The level, '' for the first.
 */
export const shareLevelOf = (value: unknown): ShareLevel =>
  SHARE_LEVELS.find((level) => level !== '' && level === value) ?? '';

/**
 * How far a level of the bar of a list is from the first: « Reprendre ceux
 * de » is past « Quelqu'un d'autre ».
 * @param level - The level.
 * @returns 0 for the first.
 */
export const shareDepth = (level: ShareLevel): number =>
  ({ '': 0, inviter: 1, confirmer: 1, reprendre: 2 })[level];
