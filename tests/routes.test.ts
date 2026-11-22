import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tabOf } from '#shared/utils/navigation';

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
