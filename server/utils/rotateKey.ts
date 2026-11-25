import { decrypt, encrypt, importDataKey } from './crypto';
import { fail, ok, type Result } from './result';

// Changing the key of the server (ticket 171, README 16): what was
// encrypted with the old `NUXT_DATA_KEY` is read with it and written with
// the new one. The prints of the addresses do not change: their pepper,
// `NUXT_PRINT_KEY`, is set to the old key (Q-043). Pure, but for the
// crypto of the platform: the script (`scripts/rotate-key.ts`) reads the
// rows and writes the statements.

/** A value encrypted with the key, where it lives. */
export type EncryptedRow = {
  table: 'participations' | 'assignments' | 'draw_answers';
  /** Its key column and value. */
  idColumn: 'id' | 'participation_id';
  id: string;
  /** The columns of the value. */
  encColumn: 'token_enc' | 'receiver_enc';
  ivColumn: 'token_iv' | 'receiver_iv';
  enc: string;
  iv: string;
};

/** One value written again with the new key. */
export type Rewritten = EncryptedRow & { newEnc: string; newIv: string };

/** What changing the key does, before anything is written. */
export type RotationPlan = {
  rewritten: Rewritten[];
  /** Values the old key does not open: already rotated, or broken. */
  unreadable: EncryptedRow[];
};

/**
 * Plans the change of the key: each value read with the old key and
 * encrypted with the new one.
 * @param input - The keys and the values.
 * @param input.oldKey - The key in use, base64.
 * @param input.newKey - The new key, base64.
 * @param input.rows - The encrypted values.
 * @returns The plan, or why not: a key that is not one, or the same key.
 */
export const planRotation = async (input: {
  oldKey: string;
  newKey: string;
  rows: readonly EncryptedRow[];
}): Promise<Result<RotationPlan>> => {
  const [oldKey, newKey] = await Promise.all([
    importDataKey(input.oldKey),
    importDataKey(input.newKey),
  ]);
  if (!oldKey.ok || !newKey.ok) return fail('invalid_data_key');
  if (input.oldKey === input.newKey) return fail('same_key');
  const read = await Promise.all(
    input.rows.map(async (row) => ({
      row,
      plain: await decrypt({ enc: row.enc, iv: row.iv }, oldKey.value),
    })),
  );
  const rewritten = await Promise.all(
    read.flatMap(({ row, plain }) =>
      plain.ok
        ? [
            encrypt(plain.value, newKey.value).then(({ enc, iv }) => ({
              ...row,
              newEnc: enc,
              newIv: iv,
            })),
          ]
        : [],
    ),
  );
  const unreadable = read
    .filter(({ plain }) => !plain.ok)
    .map(({ row }) => row);
  return ok({ rewritten, unreadable });
};

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

/**
 * The statements of a plan: each one only touches a row still as it was
 * read, so that running them twice, or after a stop, does no harm.
 * @param plan - The plan.
 * @returns The SQL, one statement a line.
 */
export const rotationStatements = (plan: RotationPlan): string[] =>
  plan.rewritten.map(
    (row) =>
      `UPDATE ${row.table} SET ${row.encColumn} = ${quote(row.newEnc)}, ${row.ivColumn} = ${quote(row.newIv)} WHERE ${row.idColumn} = ${quote(row.id)} AND ${row.encColumn} = ${quote(row.enc)};`,
  );
