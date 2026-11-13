import { nanoid } from 'nanoid';
import { importDataKey } from '../utils/crypto.js';

// Per-request dependencies injected into the pure core.

export const newId = () => nanoid();
export const nowIso = () => new Date().toISOString();

export const secretsOf = (event) => {
  const config = useRuntimeConfig(event);
  return {
    superAdminPassword: config.superAdminPassword,
    dataKey: config.dataKey,
    pinPepper: config.pinPepper,
    pbkdf2Iterations: Number(config.pbkdf2Iterations) || 20_000,
    baseUrl: config.public.baseUrl,
  };
};

/** AES key for receivers and tokens; a missing key is a deployment error. */
export const dataKeyOf = async (event) => {
  const result = await importDataKey(secretsOf(event).dataKey);
  if (!result.ok) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_DATA_KEY is missing or invalid',
    });
  }
  return result.value;
};

/** Hashed client IP, for login throttling only. */
export const ipHashOf = async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
};
