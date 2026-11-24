// The login by a code (ticket 123, README 22.22, ConnexionCode): in the
// installed app, a link from an email opens in the browser, not in the
// app; there, and only there, one logs in with six digits copied from
// the email. Good for 15 minutes, once, five tries at most, on the
// device that asked; never kept in clear. Pure, but for the hash.

/** How long a code is good. */
export const CODE_TTL_MS = 15 * 60_000;

/** How many tries a code allows: the sixth is refused, even right. */
export const CODE_TRIES = 5;

/**
 * Six digits, each as likely as the others.
 * @param random - Random bytes (`crypto.getRandomValues`).
 * @returns The code, « 482913 ».
 */
export const codeOf = (random: () => Uint32Array): string => {
  // Below the largest multiple of a million: no digit is favoured.
  const ceiling = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
  const pick = (): number => {
    const [value = 0] = random();
    return value < ceiling ? value % 1_000_000 : pick();
  };
  return String(pick()).padStart(6, '0');
};

/**
 * A code as the email shows it: « 482 913 ».
 * @param code - Six digits.
 * @returns The two halves, spaced.
 */
export const spacedCode = (code: string): string =>
  `${code.slice(0, 3)} ${code.slice(3)}`;

/**
 * The digits typed: what is not a digit goes, six at most.
 * @param typed - What was typed or pasted.
 * @returns The digits.
 */
export const codeDigits = (typed: string): string =>
  typed.replace(/\D/g, '').slice(0, 6);

/** Where a code stands, before its digits are compared. */
export type CodeState = 'open' | 'expired' | 'used' | 'spent';

/**
 * Where a code stands: used, out of time, out of tries, or open.
 * @param code - When it ends, when it was used, how many tries it had.
 * @param code.expiresAt - When it ends (ISO).
 * @param code.usedAt - When it was used, or null.
 * @param code.attempts - The tries already made.
 * @param now - Now (ISO).
 * @returns Its state.
 */
export const codeState = (
  code: { expiresAt: string; usedAt: string | null; attempts: number },
  now: string,
): CodeState => {
  if (code.usedAt) return 'used';
  if (now >= code.expiresAt) return 'expired';
  if (code.attempts >= CODE_TRIES) return 'spent';
  return 'open';
};

/**
 * The print of a code, bound to the device that asked: with the secret
 * of the server, so that a copy of the database cannot try the million
 * codes.
 * @param code - Six digits.
 * @param device - The print of the device.
 * @param secret - The secret of the server.
 * @returns The print, in hexadecimal.
 */
export const codePrint = async (
  code: string,
  device: string,
  secret: string,
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`login-code:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${device}:${code}`),
  );
  return Array.from(new Uint8Array(mac), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};
