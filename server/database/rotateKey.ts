import type { EncryptedRow } from '#server/utils/rotateKey';

// What changing the key of the server reads (ticket 171): the values
// encrypted with it. Plain SQL, so that the script reads an export the same way.

/** Runs a query and gives its rows. */
export type Query = (sql: string) => Record<string, unknown>[];

const text = (value: unknown) => String(value ?? '');

/**
 * Reads what the key protects.
 * @param query - Runs a query.
 * @returns The encrypted values.
 */
export const readRotationInput = (query: Query): { rows: EncryptedRow[] } => ({
  rows: [
    ...query('SELECT id, token_enc, token_iv FROM participations').map(
      (row): EncryptedRow => ({
        table: 'participations',
        idColumn: 'id',
        id: text(row.id),
        encColumn: 'token_enc',
        ivColumn: 'token_iv',
        enc: text(row.token_enc),
        iv: text(row.token_iv),
      }),
    ),
    ...query('SELECT id, receiver_enc, receiver_iv FROM assignments').map(
      (row): EncryptedRow => ({
        table: 'assignments',
        idColumn: 'id',
        id: text(row.id),
        encColumn: 'receiver_enc',
        ivColumn: 'receiver_iv',
        enc: text(row.receiver_enc),
        iv: text(row.receiver_iv),
      }),
    ),
    ...query(
      'SELECT participation_id, receiver_enc, receiver_iv FROM draw_answers',
    ).map((row): EncryptedRow => ({
      table: 'draw_answers',
      idColumn: 'participation_id',
      id: text(row.participation_id),
      encColumn: 'receiver_enc',
      ivColumn: 'receiver_iv',
      enc: text(row.receiver_enc),
      iv: text(row.receiver_iv),
    })),
  ],
});
