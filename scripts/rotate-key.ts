// `pnpm cle:changer <export.sql> [--ecrire <sortie.sql>] [--perdre-refus]`
// (ticket 171, README 16): plans the change of `NUXT_DATA_KEY` on an
// export of the database (`wrangler d1 export … --remote`), all locally.
// The keys come from the environment, never from the command line:
// ANCIENNE_CLE (the key in use) and NOUVELLE_CLE. Without `--ecrire`, it
// only says what it would do. With it, it writes the SQL to apply with
// `wrangler d1 execute … --file`: each statement only touches a row still
// as it was read, so applying it twice, or after a stop, does no harm.
// A blocked address the base no longer knows cannot get its print again
// (Q-043): the script stops, unless `--perdre-refus` says to lose them.
// The database loaded from the export is deleted at the end: it holds
// people's data.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { readRotationInput } from '../server/database/rotateKey.ts';
import { planRotation, rotationStatements } from '../server/utils/rotateKey.ts';

const args = process.argv.slice(2);
const dump = args.find((arg) => !arg.startsWith('--'));
const outIndex = args.indexOf('--ecrire');
const out = outIndex >= 0 ? args[outIndex + 1] : undefined;
const loseRefusals = args.includes('--perdre-refus');
const oldKey = process.env.ANCIENNE_CLE ?? '';
const newKey = process.env.NOUVELLE_CLE ?? '';
if (!dump || (outIndex >= 0 && !out) || !oldKey || !newKey) {
  console.error(
    'Usage : ANCIENNE_CLE=… NOUVELLE_CLE=… pnpm cle:changer <export.sql> [--ecrire <sortie.sql>] [--perdre-refus]',
  );
  process.exit(2);
}

const file = join(dirname(dump), 'cle-changer.sqlite');
const run = async () => {
  rmSync(file, { force: true });
  const db = new DatabaseSync(file, { enableForeignKeyConstraints: false });
  db.exec(readFileSync(dump, 'utf8'));
  const input = readRotationInput(
    (sql) => db.prepare(sql).all() as Record<string, unknown>[],
  );
  db.close();
  const planned = await planRotation({ oldKey, newKey, ...input });
  if (!planned.ok) {
    console.error(
      planned.reason === 'same_key'
        ? 'Les deux clés sont les mêmes.'
        : 'Une des deux clés n’est pas une clé (32 octets, en base64).',
    );
    process.exitCode = 1;
    return;
  }
  const plan = planned.value;
  const blocked = plan.unknownPrints.filter(
    (row) => row.table === 'email_blocks',
  );
  console.log(
    `Valeurs à réécrire avec la nouvelle clé : ${plan.rewritten.length}.`,
  );
  console.log(
    `Valeurs que l'ancienne clé n'ouvre pas (déjà réécrites, ou abîmées) : ${plan.unreadable.length}.`,
  );
  console.log(`Empreintes d'adresses recalculées : ${plan.reprinted.length}.`);
  console.log(
    `Empreintes sans adresse connue : ${blocked.length} refus, ${plan.unknownPrints.length - blocked.length} « déjà écrit » (sans gravité).`,
  );
  if (!out) {
    console.log('À blanc : rien n’est écrit. Ajouter --ecrire <sortie.sql>.');
    return;
  }
  if (blocked.length > 0 && !loseRefusals) {
    console.error(
      `${blocked.length} adresse(s) qui ont refusé nos emails ne sont plus dans la base : leur refus serait perdu. Rien n'est écrit (Q-043).`,
    );
    process.exitCode = 1;
    return;
  }
  writeFileSync(out, `${rotationStatements(plan).join('\n')}\n`);
  console.log(`Écrit : ${out}.`);
};

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => rmSync(file, { force: true }));
