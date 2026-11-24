// The end-to-end tests side by side (ticket 168): the app is built once,
// then N servers start (`scripts/e2e-server.sh`, ports 3100, 3101…), each
// with a throwaway database of its own, and N Playwright runs share the
// files between them (`--shard`: a file is never split, so a file run in
// series keeps its order and its server). One result, every failure of
// every part shown. `pnpm test:e2e` alone still runs one server.
//
// Usage: node scripts/e2e.ts [files…]   E2E_SERVERS=3 by default: on the
// laptop of 16 GB, 3 servers take 196 s, 4 take 189 s for much more
// memory, 2 take 237 s, one alone 453 s (measured on AC power, ticket 168).
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);
const wanted = Number(process.env.E2E_SERVERS ?? 3);
/** No more servers than files: a part with no file would fail. */
const servers = Math.max(
  1,
  files.length > 0 ? Math.min(wanted, files.length) : wanted,
);

/**
 * What the build is made of: the commit, and what changed since outside
 * of the tests and the docs. The same as last time: no build again.
 */
const sourceStamp = () => {
  const git = (...args: string[]) =>
    spawnSync('git', args, { encoding: 'utf8' }).stdout;
  const outside = ['--', '.', ':!tests', ':!docs', ':!scripts/e2e.ts'];
  return createHash('sha256')
    .update(git('rev-parse', 'HEAD'))
    .update(git('diff', 'HEAD', ...outside))
    .update(git('ls-files', '--others', '--exclude-standard', ...outside))
    .digest('hex');
};

const STAMP = '.output/.e2e-stamp';
const stamp = sourceStamp();
const built = existsSync(STAMP) && readFileSync(STAMP, 'utf8') === stamp;
const started = performance.now();
if (built) {
  console.log('→ construction : rien de changé depuis la dernière, gardée');
} else {
  console.log('→ construction');
  const build = spawnSync('pnpm', ['build'], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  if (build.status !== 0) {
    console.error('✗ la construction a échoué');
    process.exit(1);
  }
  writeFileSync(STAMP, stamp);
}
console.log(
  `  ⏱ construction : ${((performance.now() - started) / 1000).toFixed(1)} s`,
);

console.log(`→ parcours : ${servers} serveur(s) en parallèle`);
type Part = { index: number; output: string; status: number | null };
const run = (index: number) =>
  new Promise<Part>((resolve) => {
    const child = spawn(
      'pnpm',
      [
        'exec',
        'playwright',
        'test',
        `--shard=${index}/${servers}`,
        '--reporter=line',
        ...files,
      ],
      {
        env: {
          ...process.env,
          E2E_PORT: String(3099 + index),
          E2E_SKIP_BUILD: '1',
        },
      },
    );
    const chunks: string[] = [];
    child.stdout.on('data', (data: Buffer) => chunks.push(data.toString()));
    child.stderr.on('data', (data: Buffer) => chunks.push(data.toString()));
    child.on('close', (status) =>
      resolve({ index, output: chunks.join(''), status }),
    );
  });

const parts = await Promise.all(
  Array.from({ length: servers }, (_, at) => run(at + 1)),
);
/** The last lines of a part: its count, passed and failed. */
const summary = (output: string) =>
  output
    .split('\n')
    .filter((line) =>
      /^\s+\d+ (passed|failed|flaky|skipped|did not run)/.test(line),
    )
    .map((line) => line.trim())
    .join(', ');
// Each part's whole output, kept for after (a failure seen once is read
// again there): test-results/e2e-<port>.log.
mkdirSync('test-results', { recursive: true });
for (const part of parts) {
  writeFileSync(`test-results/e2e-${3099 + part.index}.log`, part.output);
}
const failed = parts.filter((part) => part.status !== 0);
for (const part of parts) {
  console.log(
    `  ${part.status === 0 ? '✓' : '✗'} partie ${part.index}/${servers} : ${summary(part.output) || 'aucun résultat'}`,
  );
}
for (const part of failed) {
  console.error(
    `\n─── partie ${part.index}/${servers} (port ${3099 + part.index}) ───`,
  );
  console.error(part.output);
}
console.log(
  `  ⏱ parcours : ${((performance.now() - started) / 1000).toFixed(1)} s`,
);
process.exit(failed.length > 0 ? 1 : 0);
