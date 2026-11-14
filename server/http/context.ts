import { nanoid } from 'nanoid';
import type { H3Event } from 'h3';
import { importDataKey } from '#server/utils/crypto';

// Per-request dependencies injected into the pure core.

export const newId = (): string => nanoid();
export const nowIso = (): string => new Date().toISOString();

export type Secrets = {
  superAdminPassword: string;
  dataKey: string;
  pinPepper: string;
  pbkdf2Iterations: number;
  baseUrl: string;
  resendApiKey: string;
  emailFrom: string;
};

export const secretsOf = (event: H3Event): Secrets => {
  const config = useRuntimeConfig(event);
  return {
    superAdminPassword: String(config.superAdminPassword ?? ''),
    dataKey: String(config.dataKey ?? ''),
    pinPepper: String(config.pinPepper ?? ''),
    pbkdf2Iterations: Number(config.pbkdf2Iterations) || 20_000,
    baseUrl: String(config.public.baseUrl ?? ''),
    resendApiKey: String(config.resendApiKey ?? ''),
    emailFrom: String(config.emailFrom ?? ''),
  };
};

/** AES key for receivers and tokens; a missing key is a deployment error. */
export const dataKeyOf = async (event: H3Event): Promise<CryptoKey> => {
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
export const ipHashOf = async (event: H3Event): Promise<string> => {
  // Behind Cloudflare the client address is in CF-Connecting-IP, which the
  // client cannot set. X-Forwarded-For can be forged, which would let an
  // attacker dodge the throttle by changing it on every attempt.
  const ip =
    getRequestHeader(event, 'cf-connecting-ip') ??
    getRequestIP(event) ??
    'unknown';
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
};
