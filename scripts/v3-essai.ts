// `pnpm v3:essai <export.sql>`: tries the migrations of the V3 (0034 and
// after, tickets 101 to 118) on an export of the database (`wrangler d1
// export … --remote`), all locally. The export is loaded with the foreign
// keys off (D1 writes the tables in an order that breaks them otherwise,
// which is why `wrangler d1 execute --local` refuses it). Then each
// migration the export has not applied yet (its table `d1_migrations`)
// runs in one transaction with the keys on, as D1 applies it, in order,
// and the two databases are compared. The databases are written next to
// the export, then deleted: they hold people's data. `--garder` keeps
// them, to look at them or start the application on them (ticket 113).
import { copyFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { compareV3, type Query } from '../server/database/v3Compare.ts';

const args = process.argv.slice(2);
const keep = args.includes('--garder');
const [dump] = args.filter((arg) => arg !== '--garder');
if (!dump) {
  console.error('Usage : pnpm v3:essai <export.sql> [--garder]');
  process.exit(2);
}
const before = join(dirname(dump), 'v3-essai-avant.sqlite');
const after = join(dirname(dump), 'v3-essai-apres.sqlite');
const DIR = 'server/database/migrations';

const reader =
  (db: DatabaseSync): Query =>
  (sql) =>
    db.prepare(sql).all() as Record<string, unknown>[];
const count = (query: Query, table: string) =>
  query(`SELECT count(*) AS n FROM ${table}`)[0]?.n;

/** The migrations of the folder the database has not applied, in order. */
const pending = (db: DatabaseSync) => {
  const applied = new Set(
    (
      db.prepare('SELECT name FROM d1_migrations').all() as { name: string }[]
    ).map(({ name }) => name),
  );
  return readdirSync(DIR)
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .toSorted();
};

const run = () => {
  rmSync(before, { force: true });
  rmSync(after, { force: true });
  const loaded = new DatabaseSync(before, {
    enableForeignKeyConstraints: false,
  });
  loaded.exec(readFileSync(dump, 'utf8'));
  loaded.close();
  copyFileSync(before, after);
  const migrated = new DatabaseSync(after);
  const files = pending(migrated);
  if (files[0] !== '0034_v3_parties.sql') {
    throw new Error(
      `L'export doit être à 0033, la V2 en ligne : la prochaine migration serait ${files[0] ?? 'aucune'}.`,
    );
  }
  files.forEach((file) => {
    migrated.exec('BEGIN');
    migrated.exec(readFileSync(join(DIR, file), 'utf8'));
    migrated.prepare('INSERT INTO d1_migrations (name) VALUES (?)').run(file);
    migrated.exec('COMMIT');
  });
  console.log(`Migrations appliquées : ${files.join(', ')}.`);
  const broken = migrated.prepare('PRAGMA foreign_key_check').all().length;
  const old = new DatabaseSync(before, { readOnly: true });
  const problems = [
    ...compareV3(reader(old), reader(migrated)),
    ...(broken === 0 ? [] : [`${broken} clé(s) étrangère(s) cassée(s)`]),
  ];
  console.log(
    `Avant : ${count(reader(old), 'groups')} groupes, ${count(reader(old), 'editions')} éditions, ${count(reader(old), 'gift_lists')} listes.`,
  );
  console.log(
    `Après : ${count(reader(migrated), 'parties')} événements (dont ${count(reader(migrated), 'parties WHERE from_list = 1')} nés d'une liste), ${count(reader(migrated), 'party_years')} années, ${count(reader(migrated), 'secret_santas')} Secret Santa, ${count(reader(migrated), 'gift_lists')} listes, ${count(reader(migrated), 'gift_list_parties')} rattachements.`,
  );
  old.close();
  migrated.close();
  return problems;
};

const problems = (() => {
  try {
    return run();
  } finally {
    if (!keep) {
      rmSync(before, { force: true });
      rmSync(after, { force: true });
    }
  }
})();
if (keep) console.log(`\nGardées : ${before}, ${after}.`);
if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} différence(s) :`);
  problems.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
}
console.log(
  '\n✓ Tout est là, sous sa nouvelle forme, sans clé étrangère cassée.',
);
