import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  gonePathOf,
  hintsPathOf,
  invitationPathOf,
  listsPathOf,
  partyPathOf,
  pastPathOf,
  tabOf,
} from '#shared/utils/navigation';

// Every path written in `app/` (a `to`, a `back`, a `navigateTo`) is a
// page that exists (ticket 114): not an old address, which only the
// redirects know (`app/middleware/redirects.global.ts`).

const ROOT = join(import.meta.dirname, '..');
const APP = join(ROOT, 'app');

/** Every file under a folder. */
const filesOf = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesOf(join(dir, entry.name))
      : [join(dir, entry.name)],
  );

/** The address of each page, its parameters in brackets. */
const ADDRESSES = filesOf(join(APP, 'pages'))
  .filter((file) => file.endsWith('.vue'))
  .map((file) =>
    `/${relative(join(APP, 'pages'), file)}`
      .replace(/\.vue$/, '')
      .replace(/\/index$/, '')
      .replace(/^$/, '/'),
  );

/** The pages, each as the shape of its address. */
const PAGES = ADDRESSES.map((path) => {
  const shape = path
    .split('/')
    .map((part) =>
      part.startsWith('[')
        ? '[^/]+'
        : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp(`^${shape || '/'}$`);
});

/** Whether an address is a page. */
const isPage = (path: string) =>
  PAGES.some((page) => page.test(path.replace(/(.)\/$/, '$1')));

/**
 * A path written in a template literal, each interpolation as one
 * segment; a trailing one that holds another literal (a query) dropped.
 * @param literal - The literal.
 * @returns The path.
 */
const flatten = (literal: string): string =>
  /\$\{[^{}]*\}/.test(literal)
    ? flatten(literal.replace(/\$\{[^{}]*\}/g, 'x'))
    : literal.replace(/\$\{.*$/, '');

/** Where paths are written: a `to`, a `back`, a `navigateTo`. */
const WRITTEN = /(?:\b(?:to|back)\s*[:=]|navigateTo\()\s*/g;

/**
 * The paths a source writes after `to`, `back` or `navigateTo`, each
 * interpolation as one segment, without query or hash.
 * @param source - The file's text.
 * @returns The paths.
 */
const pathsIn = (source: string) =>
  [...source.matchAll(WRITTEN)].flatMap((match) => {
    // An attribute's value (a static one quoted as a literal), on as many
    // lines as it takes; else the rest of the line.
    const rest = source.slice(match.index + match[0].length);
    const after = rest.startsWith('"')
      ? `'${/^"([^"]*)"/.exec(rest)?.[1] ?? ''}'`
      : rest.split('\n')[0];
    return [...(after ?? '').matchAll(/[`'"](\/[^`'"\s]*)/g)].map(
      ([, literal]) => flatten(literal ?? '').split(/[?#]/)[0] ?? '',
    );
  });

const written = filesOf(APP)
  .filter((file) => /\.(vue|ts)$/.test(file) && !file.endsWith('.test.ts'))
  .flatMap((file) =>
    pathsIn(readFileSync(file, 'utf8'))
      .filter((path) => path !== '' && !path.startsWith('/api/'))
      .map((path) => ({ file: relative(ROOT, file), path })),
  );

describe('the paths written in the app', () => {
  it('finds some', () => {
    expect(written.length).toBeGreaterThan(50);
  });

  it('each leads to a page', () => {
    expect(written.filter(({ path }) => !isPage(path))).toEqual([]);
  });
});

// « Quoi de neuf » and « Admin » light their tab on their pages; every
// other page is under « Accueil » (docs/spec/v3/navigation.md).
describe('the tab lit on each page', () => {
  it('is the one its address says', () => {
    const tabs = Object.fromEntries(
      ADDRESSES.map((address) => [
        address,
        tabOf(address.replace(/\[[^\]]+\]/g, 'x')),
      ]),
    );
    const lit = (tab: string) =>
      Object.keys(tabs)
        .filter((address) => tabs[address] === tab)
        .toSorted();
    expect(lit('news')).toEqual(['/quoi-de-neuf']);
    expect(lit('admin')).toEqual([
      '/admin',
      '/admin/comptes',
      '/admin/comptes/[id]',
      '/admin/groupes',
      '/admin/groupes/nouveau',
      '/admin/guide-de-style',
    ]);
    expect(tabs['/admin/[slug]/editions/[id]']).toBe('home');
  });
});

// Every page of the V2 (main, before the V3 goes out, ticket 113) still
// leads to a page, through the redirects of
// `app/middleware/redirects.global.ts`, played until nothing moves: links
// already sent by email or kept by people never give an error page.
const V2_PAGES = [
  '/',
  '/admin',
  '/admin/comptes',
  '/admin/comptes/x',
  '/admin/demandes/x',
  '/admin/groupes',
  '/admin/groupes/nouveau',
  '/admin/guide-de-style',
  '/admin/x',
  '/admin/x/editions/nouvelle',
  '/admin/x/editions/x',
  '/admin/x/editions/x/ajouter',
  '/admin/x/editions/x/annuler',
  '/admin/x/editions/x/emails',
  '/admin/x/editions/x/exclusions',
  '/admin/x/editions/x/message',
  '/admin/x/editions/x/mot',
  '/admin/x/editions/x/palmares',
  '/admin/x/editions/x/participants/x',
  '/admin/x/editions/x/rappel',
  '/admin/x/editions/x/reglages',
  '/admin/x/editions/x/voir-le-tirage',
  '/admin/x/exclusions',
  '/admin/x/invitation',
  '/admin/x/invitation/mot',
  '/admin/x/journal',
  '/admin/x/organisateurs',
  '/admin/x/personnes',
  '/admin/x/personnes/x',
  '/admin/x/personnes/nouvelle',
  '/admin/x/reglages',
  '/admin/x/reglages/mot',
  '/compte',
  '/demande',
  '/famille',
  '/famille/x',
  '/invitation/x',
  '/l/x',
  '/l/x/connexion',
  '/listes',
  '/listes/x',
  '/listes/nouvelle',
  '/login',
  '/login/x',
  '/offert-ailleurs',
  '/p/x',
  '/p/x/devine',
  '/p/x/devine/palmares',
  '/p/x/journal',
  '/p/x/liste',
  '/p/x/pistes',
  '/p/x/pistes/idee',
  '/p/x/pistes/question',
  '/p/x/pistes/texte',
  '/p/x/souhaits',
  '/p/x/tirage',
  '/rejoindre/x',
  '/tirages-passes',
];

/** Where the redirects lead a path, played until it no longer moves. */
const landing = (path: string, hops = 0): string => {
  const moved =
    partyPathOf(path) ??
    invitationPathOf(path) ??
    hintsPathOf(path) ??
    pastPathOf(path) ??
    listsPathOf(path) ??
    gonePathOf(path);
  return moved === null || hops > 5 ? path : landing(moved, hops + 1);
};

describe('the addresses of the V2', () => {
  it('each leads to a page', () => {
    expect(V2_PAGES.filter((path) => !isPage(landing(path)))).toEqual([]);
  });
});
