import { decrypt, encrypt, importDataKey } from './crypto';
import { fail, ok, type Result } from './result';
import { emailPrint, plainAddress } from './emailPrint';

// Changing the key of the server (ticket 171, README 16): what was
// encrypted with the old `NUXT_DATA_KEY` is read with it and written with
// the new one; the prints of the addresses (ticket 130) are computed
// again from the addresses the base knows. Pure, but for the crypto of
// the platform: the script (`scripts/rotate-key.ts`) reads the rows and
// writes the statements.

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

/** A print of an address, where it lives. */
export type PrintRow = { table: 'email_blocks' | 'email_seen'; print: string };

/** One print computed again with the new key. */
export type Reprinted = PrintRow & { newPrint: string };

/** What changing the key does, before anything is written. */
export type RotationPlan = {
  rewritten: Rewritten[];
  /** Values the old key does not open: already rotated, or broken. */
  unreadable: EncryptedRow[];
  reprinted: Reprinted[];
  /** Prints of addresses the base no longer knows. */
  unknownPrints: PrintRow[];
};

/**
 * Plans the change of the key: each value read with the old key and
 * encrypted with the new one; each print found again among the known
 * addresses and computed with the new key.
 * @param input - The keys, the values, the prints, the known addresses.
 * @param input.oldKey - The key in use, base64.
 * @param input.newKey - The new key, base64.
 * @param input.rows - The encrypted values.
 * @param input.prints - The prints of addresses.
 * @param input.addresses - Every address the base holds.
 * @returns The plan, or why not: a key that is not one, or the same key.
 */
export const planRotation = async (input: {
  oldKey: string;
  newKey: string;
  rows: readonly EncryptedRow[];
  prints: readonly PrintRow[];
  addresses: readonly string[];
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
  const known = [...new Set(input.addresses.map(plainAddress))];
  const byOldPrint = new Map(
    await Promise.all(
      known.map(
        async (email) =>
          [await emailPrint(email, input.oldKey), email] as const,
      ),
    ),
  );
  const found = await Promise.all(
    input.prints.map(async (row) => {
      const email = byOldPrint.get(row.print);
      return email
        ? { ...row, newPrint: await emailPrint(email, input.newKey) }
        : null;
    }),
  );
  return ok({
    rewritten,
    unreadable,
    reprinted: found.filter((one): one is Reprinted => one !== null),
    unknownPrints: input.prints.filter((_, index) => found[index] === null),
  });
};

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

/**
 * The statements of a plan: each one only touches a row still as it was
 * read, so that running them twice, or after a stop, does no harm.
 * @param plan - The plan.
 * @returns The SQL, one statement a line.
 */
export const rotationStatements = (plan: RotationPlan): string[] => [
  ...plan.rewritten.map(
    (row) =>
      `UPDATE ${row.table} SET ${row.encColumn} = ${quote(row.newEnc)}, ${row.ivColumn} = ${quote(row.newIv)} WHERE ${row.idColumn} = ${quote(row.id)} AND ${row.encColumn} = ${quote(row.enc)};`,
  ),
  ...plan.reprinted.map(
    (row) =>
      `UPDATE OR IGNORE ${row.table} SET email_print = ${quote(row.newPrint)} WHERE email_print = ${quote(row.print)};`,
  ),
];
