import { describe, it, expect } from 'vitest';
import {
  decrypt,
  encrypt,
  generateDataKey,
  generateSalt,
  generateToken,
  hashSecret,
  hashToken,
  importDataKey,
  isTrivialPin,
  secureRandomInt,
  timingSafeEqual,
  toBase64,
  fromBase64,
  verifySecret,
} from './crypto';
import { failureOf, valueOf } from '~~/tests/helpers';

const FAST = { iterations: 1_000 };

describe('encoding', () => {
  it('round-trips base64', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    expect(fromBase64(toBase64(bytes))).toEqual(bytes);
  });
});

describe('tokens', () => {
  it('generates 32-byte base64url tokens, all different', () => {
    const tokens = Array.from({ length: 50 }, generateToken);
    tokens.forEach((t) => expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/));
    expect(new Set(tokens).size).toBe(50);
  });

  it('hashes tokens with SHA-256 hex, deterministically', async () => {
    expect(await hashToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await hashToken('abc')).toBe(await hashToken('abc'));
    expect(await hashToken('abd')).not.toBe(await hashToken('abc'));
  });
});

describe('secureRandomInt', () => {
  it('stays in range and covers every value', () => {
    const values = Array.from({ length: 2_000 }, () => secureRandomInt(5));
    values.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    values.forEach((v) => expect(v).toBeLessThan(5));
    expect(new Set(values).size).toBe(5);
  });
});

describe('PIN rules', () => {
  it('refuses trivial or malformed codes', () => {
    [
      '000000',
      '111111',
      '999999',
      '123456',
      '654321',
      '345678',
      '12345',
      'abcdef',
      '',
    ].forEach((pin) => expect(isTrivialPin(pin), pin).toBe(true));
  });
  it('accepts ordinary codes', () => {
    ['123457', '102030', '246810', '987650', '200512'].forEach((pin) =>
      expect(isTrivialPin(pin), pin).toBe(false),
    );
  });
});

describe('hashSecret / verifySecret', () => {
  const salt = generateSalt();
  const pepper = 'pepper';

  it('is deterministic for the same inputs and sensitive to each of them', async () => {
    const a = await hashSecret('123457', { salt, pepper, ...FAST });
    expect(a).toBe(await hashSecret('123457', { salt, pepper, ...FAST }));
    expect(a).not.toBe(await hashSecret('123458', { salt, pepper, ...FAST }));
    expect(a).not.toBe(
      await hashSecret('123457', { salt: generateSalt(), pepper, ...FAST }),
    );
    expect(a).not.toBe(
      await hashSecret('123457', { salt, pepper: 'other', ...FAST }),
    );
    expect(a).not.toBe(
      await hashSecret('123457', { salt, pepper, iterations: 1_001 }),
    );
  });

  it('verifies the right secret and rejects a wrong one', async () => {
    const hash = await hashSecret('s3cret-pass', { salt, pepper, ...FAST });
    expect(
      await verifySecret('s3cret-pass', { hash, salt, pepper, ...FAST }),
    ).toBe(true);
    expect(
      await verifySecret('s3cret-pasS', { hash, salt, pepper, ...FAST }),
    ).toBe(false);
    expect(
      await verifySecret('s3cret-pass', { hash, salt, pepper: 'x', ...FAST }),
    ).toBe(false);
  });

  it('caps the iteration count at the Workers limit', async () => {
    const capped = await hashSecret('x', { salt, pepper, iterations: 100_000 });
    const over = await hashSecret('x', { salt, pepper, iterations: 500_000 });
    expect(over).toBe(capped);
  });

  it('compares strings in constant time semantics', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(timingSafeEqual('', '')).toBe(true);
  });
});

describe('AES-GCM', () => {
  it('round-trips and uses a fresh IV each time', async () => {
    const key = valueOf(await importDataKey(generateDataKey()));
    const first = await encrypt('person-42', key);
    const second = await encrypt('person-42', key);
    expect(first.iv).not.toBe(second.iv);
    expect(first.enc).not.toBe(second.enc);
    expect(await decrypt(first, key)).toEqual({ ok: true, value: 'person-42' });
    expect(await decrypt(second, key)).toEqual({
      ok: true,
      value: 'person-42',
    });
  });

  it('fails cleanly with another key or a tampered payload', async () => {
    const key = valueOf(await importDataKey(generateDataKey()));
    const other = valueOf(await importDataKey(generateDataKey()));
    const payload = await encrypt('secret', key);
    expect(failureOf(await decrypt(payload, other)).reason).toBe(
      'decrypt_failed',
    );
    const tampered = {
      ...payload,
      enc: payload.enc.replace(/^./, (c) => (c === 'A' ? 'B' : 'A')),
    };
    expect(failureOf(await decrypt(tampered, key)).reason).toBe(
      'decrypt_failed',
    );
  });

  it('rejects keys of the wrong size or format', async () => {
    expect(
      failureOf(await importDataKey(toBase64(new Uint8Array(16)))).reason,
    ).toBe('invalid_data_key');
    expect(failureOf(await importDataKey('not base64!')).reason).toBe(
      'invalid_data_key',
    );
    expect(failureOf(await importDataKey(undefined)).reason).toBe(
      'invalid_data_key',
    );
  });
});
