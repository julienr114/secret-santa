// `pnpm controle`: one command that says whether a ticket can be called
// done (ticket 100, the /controle skill). The quick text checks first,
// then lint, types and unit tests; `--e2e` adds Playwright. Stops at the
// first failure.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
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

type Exceptions = { files: string[]; texts: string[]; keys: string[] };

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
  const { keys } = readJson<Exceptions>(EXCEPTIONS_FILE);
  const uses = forbiddenUses(words, dictionaries, keys);
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

const run = (script: string) => {
  console.log(`\n→ pnpm ${script}`);
  const { status } = spawnSync('pnpm', [script], { stdio: 'inherit' });
  if (status !== 0) fail(`pnpm ${script} a échoué`, []);
  pass(`pnpm ${script}`);
};

const dictionaries = await loadDictionaries();
checkLanguages(dictionaries);
checkWords(dictionaries);
checkHardCodedTexts();
run('lint');
run('typecheck');
run('test');
if (process.argv.includes('--e2e')) run('test:e2e');
console.log('\npnpm controle : tout est passé.');
