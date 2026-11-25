import { describe, expect, it } from 'vitest';
import { decrypt, encrypt, generateDataKey, importDataKey } from './crypto';
import { planRotation, rotationStatements } from './rotateKey';
import { failureOf, valueOf } from '~~/tests/helpers';

const keyOf = async (base64: string) => {
  const key = await importDataKey(base64);
  if (!key.ok) throw new Error('key');
  return key.value;
};

describe('changing the key of the server (ticket 171)', () => {
  it('writes each value again with the new key, the same once read', async () => {
    const oldKey = generateDataKey();
    const newKey = generateDataKey();
    const sealed = await encrypt('person-zoe', await keyOf(oldKey));
    const plan = valueOf(
      await planRotation({
        oldKey,
        newKey,
        rows: [
          {
            table: 'assignments',
            idColumn: 'id',
            id: 'a1',
            encColumn: 'receiver_enc',
            ivColumn: 'receiver_iv',
            ...sealed,
          },
        ],
      }),
    );
    expect(plan.rewritten).toHaveLength(1);
    const row = plan.rewritten[0]!;
    const opened = await decrypt(
      { enc: row.newEnc, iv: row.newIv },
      await keyOf(newKey),
    );
    expect(opened).toEqual({ ok: true, value: 'person-zoe' });
    // The old key no longer opens it.
    expect(
      (await decrypt({ enc: row.newEnc, iv: row.newIv }, await keyOf(oldKey)))
        .ok,
    ).toBe(false);
  });

  it('leaves alone a value the old key does not open: run twice, no harm', async () => {
    const oldKey = generateDataKey();
    const newKey = generateDataKey();
    const already = await encrypt('token', await keyOf(newKey));
    const plan = valueOf(
      await planRotation({
        oldKey,
        newKey,
        rows: [
          {
            table: 'participations',
            idColumn: 'id',
            id: 'p1',
            encColumn: 'token_enc',
            ivColumn: 'token_iv',
            ...already,
          },
        ],
      }),
    );
    expect(plan.rewritten).toHaveLength(0);
    expect(plan.unreadable).toHaveLength(1);
  });

  it('writes statements that touch a row only as it was read', async () => {
    const statements = rotationStatements({
      rewritten: [
        {
          table: 'participations',
          idColumn: 'id',
          id: "p'1",
          encColumn: 'token_enc',
          ivColumn: 'token_iv',
          enc: 'old',
          iv: 'oldiv',
          newEnc: 'new',
          newIv: 'newiv',
        },
      ],
      unreadable: [],
    });
    expect(statements).toEqual([
      "UPDATE participations SET token_enc = 'new', token_iv = 'newiv' WHERE id = 'p''1' AND token_enc = 'old';",
    ]);
  });

  it('refuses a key that is not one, or the same key', async () => {
    const key = generateDataKey();
    expect(
      failureOf(
        await planRotation({
          oldKey: key,
          newKey: 'x',
          rows: [],
        }),
      ).reason,
    ).toBe('invalid_data_key');
    expect(
      failureOf(
        await planRotation({
          oldKey: key,
          newKey: key,
          rows: [],
        }),
      ).reason,
    ).toBe('same_key');
  });
});
