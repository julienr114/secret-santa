import { nanoid } from 'nanoid';
import type { H3Event } from 'h3';
import { LINK_REQUESTS_MAX_PER_IP } from '#server/utils/accounts';
import { importDataKey } from '#server/utils/crypto';

// Per-request dependencies injected into the pure core.

export const newId = (): string => nanoid();
export const nowIso = (): string => new Date().toISOString();

export type Secrets = {
  dataKey: string;
  baseUrl: string;
  resendApiKey: string;
  superAdminEmails: string;
  devLoginLinks: boolean;
  linkRequestsPerIp: number;
  emailFrom: string;
};

/**
 * The settings of the app, for a request or, without one (a scheduled
 * task), from the environment.
 */
export const secretsOf = (event?: H3Event): Secrets => {
  const config = useRuntimeConfig(event);
  return {
    dataKey: String(config.dataKey ?? ''),
    baseUrl: String(config.public.baseUrl ?? ''),
    resendApiKey: String(config.resendApiKey ?? ''),
    superAdminEmails: String(config.superAdminEmails ?? ''),
    devLoginLinks: String(config.devLoginLinks) === 'true',
    linkRequestsPerIp:
      Number(config.linkRequestsPerIp) || LINK_REQUESTS_MAX_PER_IP,
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

/**
 * An absolute address of the app, for links sent by email.
 * @param event - The request, used when no base URL is configured.
 * @param path - Path starting with a slash.
 * @returns The full URL.
 */
export const appUrl = (event: H3Event | undefined, path: string): string => {
  const base =
    secretsOf(event).baseUrl || (event ? getRequestURL(event).origin : '');
  return `${base.replace(/\/$/, '')}${path}`;
};
