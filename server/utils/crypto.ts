import { ok, fail, type Result } from './result';

// Web Crypto only (README section 8): available in Node 22 and in Workers.
// Nothing here touches the database; callers pass salts, pepper and keys in.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const toBase64 = (bytes: Uint8Array): string =>
  btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
export const fromBase64 = (text: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array([...atob(text)].map((c) => c.charCodeAt(0)));
export const toBase64Url = (bytes: Uint8Array): string =>
  toBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export const randomBytes = (length: number): Uint8Array<ArrayBuffer> =>
  crypto.getRandomValues(new Uint8Array(length));

/**
 * Uniform random integer in [0, n) from crypto.getRandomValues, with
 * rejection sampling to avoid modulo bias. Never Math.random (README 6.2).
 */
export const secureRandomInt = (n: number): number => {
  const limit = Math.floor(2 ** 32 / n) * n;
  const value = crypto.getRandomValues(new Uint32Array(1))[0] as number;
  return value < limit ? value % n : secureRandomInt(n);
};

// --- Personal links (README 8.1) ---------------------------------------

/** 32 random bytes, base64url: the part after /p/ in a personal link. */
export const generateToken = (): string => toBase64Url(randomBytes(32));

/** SHA-256 hex of a token, the only form stored for lookup. */
export const hashToken = async (token: string): Promise<string> =>
  toHex(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', encoder.encode(token)),
    ),
  );

// --- Guardian passwords (README 8.4) ----------------------------------

export const DEFAULT_PBKDF2_ITERATIONS = 20_000;
export const MAX_PBKDF2_ITERATIONS = 100_000;

export const generateSalt = (): string => toBase64(randomBytes(16));

export type HashOptions = { salt: string; pepper: string; iterations?: number };

/**
 * PBKDF2-SHA256 of secret+pepper with a per-person salt. The pepper lives
 * only in the environment, so a copy of the database alone is useless.
 * @returns base64 hash
 */
export const hashSecret = async (
  secret: string,
  { salt, pepper, iterations }: HashOptions,
): Promise<string> => {
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
export const timingSafeEqual = (a: string, b: string): boolean => {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const diff = left.reduce((acc, byte, i) => acc | (byte ^ (right[i] ?? 0)), 0);
  return left.length === right.length && diff === 0;
};

export const verifySecret = async (
  secret: string,
  { hash, salt, pepper, iterations }: HashOptions & { hash: string },
): Promise<boolean> =>
  timingSafeEqual(await hashSecret(secret, { salt, pepper, iterations }), hash);

// --- Results and tokens at rest (README 8.3) ----------------------------

/** For setup docs: a fresh DATA_KEY value. */
export const generateDataKey = (): string => toBase64(randomBytes(32));

const decodeKey = (base64Key: string | undefined): Uint8Array<ArrayBuffer> => {
  try {
    return fromBase64(base64Key ?? '');
  } catch {
    return new Uint8Array();
  }
};

/** @param base64Key 32 bytes, base64 */
export const importDataKey = async (
  base64Key: string | undefined,
): Promise<Result<CryptoKey>> => {
  const bytes = decodeKey(base64Key);
  if (bytes.length !== 32)
    return fail('invalid_data_key', { length: bytes.length });
  const key = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
  return ok(key);
};

export type Encrypted = { enc: string; iv: string };

/** AES-256-GCM with a fresh 12-byte IV per value. */
export const encrypt = async (
  plaintext: string,
  key: CryptoKey,
): Promise<Encrypted> => {
  const iv = randomBytes(12);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );
  return { enc: toBase64(new Uint8Array(cipher)), iv: toBase64(iv) };
};

export const decrypt = async (
  { enc, iv }: Encrypted,
  key: CryptoKey,
): Promise<Result<string>> => {
  const plain = await crypto.subtle
    .decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(enc))
    .catch(() => null);
  return plain ? ok(decoder.decode(plain)) : fail('decrypt_failed');
};
