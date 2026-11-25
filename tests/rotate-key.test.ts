import { describe, expect, it } from 'vitest';
import { testDb } from './d1';
import { encrypt, generateDataKey, importDataKey } from '#server/utils/crypto';
import { emailPrint } from '#server/utils/emailPrint';
import { planRotation, rotationStatements } from '#server/utils/rotateKey';
import { readRotationInput } from '#server/database/rotateKey';
import { findReceiverParticipationId } from '#server/database/draw';
import { personalPath } from '#server/database/participations';
import { blockedOf } from '#server/database/emailBlocks';

// Changing the key of the server on a test base (ticket 171): after the
// change, a result is read, a personal link opens, a blocked address
// stays blocked (its print does not change: `NUXT_PRINT_KEY` keeps the
// old key, Q-043); and applying the statements twice does no harm.

const NOW = '2026-11-25T10:00:00.000Z';
const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ah', 'hugo@x.fr', 'Hugo', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'ah', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1', 'p1', 2026, '2026-12-25', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', '${NOW}'),
  ('z1', 'p1', 'Zoé', 'Zoe@X.fr', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, drawn_at, created_at) VALUES
  ('s1', 'p1', 'y1', 'Noël 2026', 'drawn', '${NOW}', '${NOW}');
`;

const keyOf = async (base64: string) => {
  const key = await importDataKey(base64);
  if (!key.ok) throw new Error('key');
  return key.value;
};

describe('changing the key of the server', () => {
  it('keeps the results, the links and the refusals', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(SETUP);
    const oldKey = generateDataKey();
    const newKey = generateDataKey();
    const token = await encrypt('jeton-h1', await keyOf(oldKey));
    sqlite
      .prepare(
        `INSERT INTO participations (id, secret_santa_id, person_id, token_hash, token_enc, token_iv)
         VALUES ('p-h1', 's1', 'h1', 'hash-h1', ?, ?), ('p-z1', 's1', 'z1', 'hash-z1', ?, ?)`,
      )
      .run(token.enc, token.iv, token.enc, token.iv);
    const receiver = await encrypt('z1', await keyOf(oldKey));
    sqlite
      .prepare(
        `INSERT INTO assignments (id, secret_santa_id, giver_person_id, receiver_enc, receiver_iv, created_at)
         VALUES ('a1', 's1', 'h1', ?, ?, '${NOW}')`,
      )
      .run(receiver.enc, receiver.iv);
    sqlite
      .prepare(
        `INSERT INTO email_blocks (email_print, cause, created_at) VALUES (?, 'person', '${NOW}')`,
      )
      .run(await emailPrint('zoe@x.fr', oldKey));

    const planned = await planRotation({
      oldKey,
      newKey,
      ...readRotationInput(
        (sql) => sqlite.prepare(sql).all() as Record<string, unknown>[],
      ),
    });
    if (!planned.ok) throw new Error(planned.reason);
    const plan = planned.value;
    const statements = rotationStatements(plan).join('\n');
    sqlite.exec(statements);
    // Twice: the rows already written are not touched again.
    sqlite.exec(statements);

    const key = await keyOf(newKey);
    expect(await findReceiverParticipationId(db, 's1', 'h1', key)).toBe('p-z1');
    const [participation] = sqlite
      .prepare(
        "SELECT token_enc, token_iv FROM participations WHERE id = 'p-h1'",
      )
      .all() as { token_enc: string; token_iv: string }[];
    expect(
      await personalPath(
        {
          tokenEnc: participation!.token_enc,
          tokenIv: participation!.token_iv,
        },
        key,
      ),
    ).toBe('/p/jeton-h1');
    const print = await emailPrint('zoe@x.fr', oldKey);
    expect((await blockedOf(db, [print])).get(print)).toBe('person');
  });
});
