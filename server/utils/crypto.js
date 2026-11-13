import { z } from 'zod';
import { ok, fail } from './result.js';

// Web Crypto only (README section 8): available in Node 22 and in Workers.
// Nothing here touches the database; callers pass salts, pepper and keys in.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const toBase64 = (bytes) =>
  btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
export const fromBase64 = (text) =>
  Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
export const toBase64Url = (bytes) =>
  toBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
export const toHex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export const randomBytes = (length) =>
  crypto.getRandomValues(new Uint8Array(length));

/**
 * Uniform random integer in [0, n) from crypto.getRandomValues, with
 * rejection sampling to avoid modulo bias. Never Math.random (README 6.2).
 * @param {number} n
 */
export const secureRandomInt = (n) => {
  const limit = Math.floor(2 ** 32 / n) * n;
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value < limit ? value % n : secureRandomInt(n);
};

// --- Personal links (README 8.1) ---------------------------------------

/** 32 random bytes, base64url: the part after /p/ in a personal link. */
export const generateToken = () => toBase64Url(randomBytes(32));

/** SHA-256 hex of a token, the only form stored for lookup. */
export const hashToken = async (token) =>
  toHex(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', encoder.encode(token)),
    ),
  );

// --- PIN codes and guardian passwords (README 8.2, 8.4) -----------------

export const DEFAULT_PBKDF2_ITERATIONS = 20_000;
export const MAX_PBKDF2_ITERATIONS = 100_000;

export const pinSchema = z.string().regex(/^\d{6}$/, 'six digits');

const isStraight = (digits, step) =>
  digits.every((d, i) => i === 0 || d - digits[i - 1] === step);

/** 000000, 123456, 654321 and friends are refused (README 8.2). */
export const isTrivialPin = (pin) => {
  if (!pinSchema.safeParse(pin).success) return true;
  const digits = [...pin].map(Number);
  return (
    new Set(digits).size === 1 ||
    isStraight(digits, 1) ||
    isStraight(digits, -1)
  );
};

export const generateSalt = () => toBase64(randomBytes(16));

/**
 * PBKDF2-SHA256 of secret+pepper with a per-person salt. The pepper lives
 * only in the environment, so a copy of the database alone is useless.
 * @param {string} secret
 * @param {{ salt: string, pepper: string, iterations?: number }} options
 * @returns {Promise<string>} base64 hash
 */
export const hashSecret = async (secret, { salt, pepper, iterations }) => {
  const rounds = Math.min(
    iterations ?? DEFAULT_PBKDF2_ITERATIONS,
    MAX_PBKDF2_ITERATIONS,
  );
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${pepper}\u0000${secret}`),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: fromBase64(salt),
      iterations: rounds,
    },
    keyMaterial,
    256,
  );
  return toBase64(new Uint8Array(bits));
};

/** Constant-time string comparison. */
export const timingSafeEqual = (a, b) => {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const diff = left.reduce((acc, byte, i) => acc | (byte ^ (right[i] ?? 0)), 0);
  return left.length === right.length && diff === 0;
};

/** @returns {Promise<boolean>} */
export const verifySecret = async (
  secret,
  { hash, salt, pepper, iterations },
) =>
  timingSafeEqual(await hashSecret(secret, { salt, pepper, iterations }), hash);

// --- Results and tokens at rest (README 8.3) ----------------------------

/** For setup docs: a fresh DATA_KEY value. */
export const generateDataKey = () => toBase64(randomBytes(32));

/**
 * @param {string} base64Key 32 bytes, base64
 * @returns {Promise<import('./result.js').Result<CryptoKey>>}
 */
export const importDataKey = async (base64Key) => {
  const bytes = (() => {
    try {
      return fromBase64(base64Key ?? '');
    } catch {
      return new Uint8Array();
    }
  })();
  if (bytes.length !== 32)
    return fail('invalid_data_key', { length: bytes.length });
  const key = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
  return ok(key);
};

/**
 * AES-256-GCM with a fresh 12-byte IV per value.
 * @param {string} plaintext
 * @param {CryptoKey} key
 * @returns {Promise<{ enc: string, iv: string }>}
 */
export const encrypt = async (plaintext, key) => {
  const iv = randomBytes(12);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );
  return { enc: toBase64(new Uint8Array(cipher)), iv: toBase64(iv) };
};

/**
 * @param {{ enc: string, iv: string }} payload
 * @param {CryptoKey} key
 * @returns {Promise<import('./result.js').Result<string>>}
 */
export const decrypt = async ({ enc, iv }, key) => {
  const plain = await crypto.subtle
    .decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(enc))
    .catch(() => null);
  return plain ? ok(decoder.decode(plain)) : fail('decrypt_failed');
};
