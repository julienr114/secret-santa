// `pnpm controle`: one command that says whether a ticket can be called
// done (ticket 100, the /controle skill). The quick text checks first,
// then lint, types and unit tests; `--e2e` adds every end-to-end test,
// several servers side by side (scripts/e2e.ts, ticket 168). Stops at the
// first failure, and says how long each step took.
//
// `--vite [files…]`, for the time of a ticket (ticket 168): the texts,
// lint and types, then only the unit tests related to the files changed
// since `main` (committed or not), and only the end-to-end files named.
// Before saying « fini », `--e2e`, the whole of it, once.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  flatten,
  forbiddenUses,
  hardCodedTexts,
  missingKeys,
  type Texts,
  type Tree,
} from './controle-checks.ts';

const LOCALES_DIR = join('shared', 'i18n', 'locales');
const WORDS_FILE = join('scripts', 'controle.mots.json');
const EXCEPTIONS_FILE = join('scripts', 'controle.exceptions.json');

type Exceptions = { files: string[]; texts: string[] };

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(path, 'utf8')) as T;

const filesUnder = (dir: string, extension: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith(extension))
    .map((file) => join(dir, file))
    .toSorted();

/**
 * One dictionary per language, read namespace by namespace: index.ts
 * imports without extensions, which Node cannot resolve, while each
 * namespace only imports types.
 */
const loadDictionaries = async (): Promise<Record<string, Texts>> => {
  const locales = readdirSync(LOCALES_DIR).toSorted();
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const files = readdirSync(join(LOCALES_DIR, locale)).filter(
        (file) => file.endsWith('.ts') && file !== 'index.ts',
      );
      const namespaces = await Promise.all(
        files.map(async (file) => {
          const url = pathToFileURL(join(LOCALES_DIR, locale, file)).href;
          const module = (await import(url)) as { default: Tree };
          return [file.replace(/\.ts$/, ''), module.default] as const;
        }),
      );
      return [locale, flatten(Object.fromEntries(namespaces))] as const;
    }),
  );
  return Object.fromEntries(entries);
};

const fail = (title: string, lines: string[]): never => {
  console.error(`\n✗ ${title}\n`);
  lines.forEach((line) => console.error(`  ${line}`));
  console.error('\npnpm controle : échec.');
  process.exit(1);
};

const pass = (title: string) => console.log(`✓ ${title}`);

/** Each step with its time (ticket 168): what is slow shows. */
const timed = <T>(title: string, step: () => T): T => {
  const start = performance.now();
  const result = step();
  const seconds = ((performance.now() - start) / 1000).toFixed(1);
  console.log(`  ⏱ ${title} : ${seconds} s`);
  return result;
};

const checkLanguages = (dictionaries: Record<string, Texts>) => {
  const missing = missingKeys(dictionaries);
  if (missing.length > 0) {
    fail(
      `Les trois langues : ${missing.length} clé(s) manquante(s)`,
      missing.map(({ locale, key }) => `${locale} : ${key}`),
    );
  }
  pass('Les trois langues ont les mêmes clés');
};

const checkWords = (dictionaries: Record<string, Texts>) => {
  const words = readJson<string[]>(WORDS_FILE);
  const uses = forbiddenUses(words, dictionaries);
  if (uses.length > 0) {
    fail(
      `Mots interdits (${WORDS_FILE}) : ${uses.length} texte(s)`,
      uses.map(
        ({ locale, key, word, text }) =>
          `${locale} : ${key} dit « ${word} » : ${text}`,
      ),
    );
  }
  pass(`Aucun mot interdit (${words.length} dans la liste)`);
};

const checkHardCodedTexts = () => {
  const exceptions = readJson<Exceptions>(EXCEPTIONS_FILE);
  const found = filesUnder('app', '.vue')
    .filter((file) => !exceptions.files.includes(file))
    .flatMap((file) =>
      hardCodedTexts(readFileSync(file, 'utf8'), exceptions.texts).map(
        ({ line, text }) => `${relative('.', file)}:${line} « ${text} »`,
      ),
    );
  if (found.length > 0) {
    fail(
      `Textes en dur dans app/ : ${found.length} (à passer par shared/i18n/locales, ou à ajouter à ${EXCEPTIONS_FILE})`,
      found,
    );
  }
  pass('Aucun texte en dur dans les gabarits de app/');
};

const run = (script: string, ...args: string[]) => {
  const command = ['pnpm', script, ...args].join(' ');
  console.log(`\n→ ${command}`);
  const { status } = spawnSync('pnpm', [script, ...args], { stdio: 'inherit' });
  if (status !== 0) fail(`${command} a échoué`, []);
  pass(command);
};

/** The files changed since `main`, committed or not, and new ones. */
const changedFiles = (): string[] => {
  const git = (...args: string[]) =>
    spawnSync('git', args, { encoding: 'utf8' }).stdout.trim();
  const base = git('merge-base', 'main', 'HEAD');
  return [
    ...new Set(
      [
        git('diff', '--name-only', base),
        git('ls-files', '--others', '--exclude-standard'),
      ]
        .join('\n')
        .split('\n')
        .filter((file) => file && existsSync(file)),
    ),
  ];
};

/** The end-to-end tests, several servers side by side (ticket 168). */
const e2e = (files: string[]) => {
  console.log(`\n→ parcours${files.length > 0 ? ` : ${files.join(' ')}` : ''}`);
  const { status } = spawnSync(
    'node',
    ['--experimental-strip-types', '--no-warnings', 'scripts/e2e.ts', ...files],
    { stdio: 'inherit' },
  );
  if (status !== 0) fail('Les parcours ont échoué', []);
  pass('les parcours');
};

const quick = process.argv.includes('--vite');
const named = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const started = performance.now();
const dictionaries = await loadDictionaries();
timed('les textes', () => {
  checkLanguages(dictionaries);
  checkWords(dictionaries);
  checkHardCodedTexts();
});
timed('lint', () => run('lint'));
timed('types', () => run('typecheck'));
if (quick) {
  const changed = changedFiles().filter((file) => /\.(ts|vue|mjs)$/.test(file));
  timed('tests unitaires liés', () =>
    changed.length > 0
      ? run('exec', 'vitest', 'related', '--run', ...changed)
      : console.log('\n→ aucun fichier changé : pas de test unitaire'),
  );
  if (named.length > 0) e2e(named);
  console.log(
    `\npnpm controle --vite : passé (${((performance.now() - started) / 1000).toFixed(0)} s). Avant de dire « fini » : pnpm controle --e2e.`,
  );
  process.exit(0);
}
timed('tests unitaires', () => run('test'));
if (process.argv.includes('--e2e')) e2e([]);
console.log(
  `\npnpm controle : tout est passé (${((performance.now() - started) / 1000).toFixed(0)} s).`,
);
