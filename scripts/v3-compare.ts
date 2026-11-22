// `pnpm v3:compare <before.sqlite> <after.sqlite>`: says whether a copy of
// the database migrated to the V3 still has every group, draw, envelope,
// list, idea and tick of the copy before (tickets 101 and 113). Read only
// on both files. The steps for a copy of the production database are in
// docs/travail/bascule-v3.md.
import { DatabaseSync } from 'node:sqlite';
import { compareV3, type Query } from '../server/database/v3Compare.ts';

const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error('Usage : pnpm v3:compare <avant.sqlite> <après.sqlite>');
  process.exit(2);
}

const reader = (path: string): Query => {
  const db = new DatabaseSync(path, { readOnly: true });
  return (sql) => db.prepare(sql).all() as Record<string, unknown>[];
};

const before = reader(beforePath);
const after = reader(afterPath);
const count = (query: Query, table: string) =>
  query(`SELECT count(*) AS n FROM ${table}`)[0]?.n;

const problems = compareV3(before, after);
console.log(
  `Avant : ${count(before, 'groups')} groupes, ${count(before, 'editions')} éditions, ${count(before, 'gift_lists')} listes.`,
);
console.log(
  `Après : ${count(after, 'parties')} événements (dont ${count(after, 'parties WHERE from_list = 1')} nés d'une liste), ${count(after, 'party_years')} années, ${count(after, 'secret_santas')} Secret Santa, ${count(after, 'gift_lists')} listes, ${count(after, 'gift_list_parties')} rattachements.`,
);
if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} différence(s) :`);
  problems.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
}
console.log('\n✓ Tout est là, sous sa nouvelle forme.');
