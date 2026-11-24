import type { H3Event } from 'h3';
import { generateToken, hashToken } from '#server/utils/crypto';

// The device that asked for a login code (ticket 123): a random cookie of
// its own, only ever sent back by this browser; its hash binds the code,
// so that a code asked on one device logs no other in.

const DEVICE_COOKIE = 'utt_device';

/**
 * The print of this device, given it a cookie if it has none.
 * @param event - The request.
 * @returns The print of its cookie.
 */
export const deviceOf = async (event: H3Event): Promise<string> => {
  const existing = getCookie(event, DEVICE_COOKIE);
  const token = existing ?? generateToken();
  if (!existing) {
    setCookie(event, DEVICE_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: getRequestProtocol(event) === 'https',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return hashToken(token);
};

/**
 * The print of this device, if it has its cookie.
 * @param event - The request.
 * @returns The print, or null.
 */
export const knownDeviceOf = async (event: H3Event): Promise<string | null> => {
  const token = getCookie(event, DEVICE_COOKIE);
  return token ? hashToken(token) : null;
};
