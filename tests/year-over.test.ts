import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { testDb } from './d1';
import { requireOpenYear } from '../server/database/years';

// « Une année passée ne se modifie par aucune route » (ticket 108). Every
// route that writes to a Secret Santa, from its organiser or from a
// personal link, goes through a guard that refuses a year over; only
// closing, revealing and marking what one has seen stay open after it.
// And the guard itself, on a real database.

const ROOT = join(__dirname, '..');

/** Every file under a folder. */
const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });

/** The routes that write, under a folder of server/api. */
const writingRoutes = (dir: string) =>
  filesUnder(join(ROOT, 'server/api', dir))
    .filter((path) => /\.(post|put|patch|delete)\.ts$/.test(path))
    .map((path) => relative(ROOT, path));

const GUARDS = [
  'requireEdition(event',
  'requirePersonalLink(event',
  'requireParticipation(event',
  'requireOpenYear(',
  // « Ma liste de cadeaux » (ticket 136): requirePersonalLink, with the
  // account checked to be the person's.
  'requireMyDraw(event',
];

/** What stays open once the year is over: out of the ticket. */
const AFTER_THE_YEAR = [
  'server/api/admin/[slug]/editions/[id]/close.post.ts',
  'server/api/admin/[slug]/editions/[id]/reveal.post.ts',
  'server/api/admin/[slug]/editions/[id]/reveal-one.post.ts',
  'server/api/p/[token]/reveal.post.ts',
  'server/api/p/[token]/guess/seen.post.ts',
  'server/api/p/[token]/journal-seen.post.ts',
  'server/api/p/[token]/language.put.ts',
  'server/api/p/[token]/seen.post.ts',
].toSorted();

describe('a year over, by every route', () => {
  const routes = [
    ...writingRoutes('admin/[slug]/editions/[id]'),
    'server/api/admin/[slug]/editions/[id].patch.ts',
    'server/api/admin/[slug]/editions/[id].delete.ts',
    ...writingRoutes('admin/[slug]/participations'),
    ...writingRoutes('p/[token]'),
  ];

  it('finds the routes that write', () => {
    expect(routes.length).toBeGreaterThan(30);
  });

  it.each(routes)('%s goes through a guard of the year', (route) => {
    const source = readFileSync(join(ROOT, route), 'utf8');
    expect(GUARDS.some((guard) => source.includes(guard))).toBe(true);
  });

  it('leaves open only closing, revealing and what one has seen', () => {
    expect(
      routes
        .filter((route) =>
          readFileSync(join(ROOT, route), 'utf8').includes('afterTheYear'),
        )
        .toSorted(),
    ).toEqual(AFTER_THE_YEAR);
  });

  it('makes no Secret Santa in a year over', () => {
    expect(
      readFileSync(
        join(ROOT, 'server/api/admin/[slug]/editions/index.post.ts'),
        'utf8',
      ),
    ).toContain('requireOpenYearNumber(');
  });
});

describe('requireOpenYear', () => {
  vi.stubGlobal(
    'createError',
    (error: { statusCode: number; statusMessage: string }) =>
      Object.assign(new Error(error.statusMessage), error),
  );
  const NOW = '2020-01-01T00:00:00.000Z';
  const setup = () => {
    const { db, sqlite } = testDb();
    sqlite.exec(`
INSERT INTO parties (id, slug, name, rules, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille', '{}', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y2019', 'p1', 2019, '2019-12-25', '${NOW}'),
  ('y2099', 'p1', 2099, '2099-12-25', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, created_at) VALUES
  ('s2019', 'p1', 'y2019', 'Noël 2019', 'closed', '${NOW}');
`);
    return db;
  };

  it('refuses a year over', async () => {
    await expect(requireOpenYear(setup(), 'p1', 'y2019')).rejects.toMatchObject(
      { statusCode: 409, statusMessage: 'year_over' },
    );
  });

  it('lets the current year change', async () => {
    await expect(
      requireOpenYear(setup(), 'p1', 'y2099'),
    ).resolves.toBeUndefined();
  });
});
