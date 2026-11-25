import { describe, expect, it } from 'vitest';
import { decrypt, encrypt, generateDataKey, importDataKey } from './crypto';
import { emailPrint } from './emailPrint';
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
        prints: [],
        addresses: [],
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
        prints: [],
        addresses: [],
      }),
    );
    expect(plan.rewritten).toHaveLength(0);
    expect(plan.unreadable).toHaveLength(1);
  });

  it('computes the prints again from the known addresses, and says the rest', async () => {
    const oldKey = generateDataKey();
    const newKey = generateDataKey();
    const blocked = await emailPrint('Lea@Example.com', oldKey);
    const stranger = await emailPrint('gone@example.com', oldKey);
    const plan = valueOf(
      await planRotation({
        oldKey,
        newKey,
        rows: [],
        prints: [
          { table: 'email_blocks', print: blocked },
          { table: 'email_blocks', print: stranger },
        ],
        addresses: ['lea@example.com', 'tom@example.com'],
      }),
    );
    expect(plan.reprinted).toEqual([
      {
        table: 'email_blocks',
        print: blocked,
        newPrint: await emailPrint('lea@example.com', newKey),
      },
    ]);
    expect(plan.unknownPrints).toEqual([
      { table: 'email_blocks', print: stranger },
    ]);
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
      reprinted: [{ table: 'email_seen', print: 'aa', newPrint: 'bb' }],
      unknownPrints: [],
    });
    expect(statements).toEqual([
      "UPDATE participations SET token_enc = 'new', token_iv = 'newiv' WHERE id = 'p''1' AND token_enc = 'old';",
      "UPDATE OR IGNORE email_seen SET email_print = 'bb' WHERE email_print = 'aa';",
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
          prints: [],
          addresses: [],
        }),
      ).reason,
    ).toBe('invalid_data_key');
    expect(
      failureOf(
        await planRotation({
          oldKey: key,
          newKey: key,
          rows: [],
          prints: [],
          addresses: [],
        }),
      ).reason,
    ).toBe('same_key');
  });
});
