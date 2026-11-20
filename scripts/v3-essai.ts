// `pnpm v3:essai <export.sql>`: tries migration 0033 (ticket 101) on an
// export of the database (`wrangler d1 export … --remote`), all locally.
// The export is loaded with the foreign keys off (D1 writes the tables in
// an order that breaks them otherwise, which is why `wrangler d1 execute
// --local` refuses it), then 0033 runs in one transaction with the keys on,
// as D1 applies it, and the two databases are compared. The databases are
// written next to the export, then deleted: they hold people's data.
import { copyFileSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { compareV3, type Query } from '../server/database/v3Compare.ts';

const [dump] = process.argv.slice(2);
if (!dump) {
  console.error('Usage : pnpm v3:essai <export.sql>');
  process.exit(2);
}
const before = join(dirname(dump), 'v3-essai-avant.sqlite');
const after = join(dirname(dump), 'v3-essai-apres.sqlite');
const MIGRATION = 'server/database/migrations/0033_v3_parties.sql';

const reader =
  (db: DatabaseSync): Query =>
  (sql) =>
    db.prepare(sql).all() as Record<string, unknown>[];
const count = (query: Query, table: string) =>
  query(`SELECT count(*) AS n FROM ${table}`)[0]?.n;

const run = () => {
  const loaded = new DatabaseSync(before, {
    enableForeignKeyConstraints: false,
  });
  loaded.exec(readFileSync(dump, 'utf8'));
  loaded.close();
  copyFileSync(before, after);
  const migrated = new DatabaseSync(after);
  migrated.exec('BEGIN');
  migrated.exec(readFileSync(MIGRATION, 'utf8'));
  migrated.exec('COMMIT');
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
    `Après : ${count(reader(migrated), 'parties')} fêtes (dont ${count(reader(migrated), 'parties WHERE from_list = 1')} nées d'une liste), ${count(reader(migrated), 'party_years')} années, ${count(reader(migrated), 'secret_santas')} Secret Santa, ${count(reader(migrated), 'gift_list_parties')} listes rangées.`,
  );
  old.close();
  migrated.close();
  return problems;
};

const problems = (() => {
  try {
    return run();
  } finally {
    rmSync(before, { force: true });
    rmSync(after, { force: true });
  }
})();
if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} différence(s) :`);
  problems.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
}
console.log(
  '\n✓ Tout est là, sous sa nouvelle forme, sans clé étrangère cassée.',
);
