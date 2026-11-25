// The print of an address (ticket 130): an address is known by it,
// never kept in clear for someone without an account. Apart from
// `stopEmail.ts`, so that the script that changes the key (ticket 171)
// reads it without the texts of the app.

const encoder = new TextEncoder();

/**
 * An address as the app keeps it: lower case, trimmed.
 * @param email - The address.
 * @returns The same, plain.
 */
export const plainAddress = (email: string): string =>
  email.trim().toLowerCase();

/**
 * The print of an address, with the pepper of the server: the same
 * address always gives the same print, which says nothing of it.
 * @param email - The address.
 * @param secret - The secret of the server.
 * @returns The print, in hexadecimal.
 */
export const emailPrint = async (
  email: string,
  secret: string,
): Promise<string> => {
  const mac = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(`email-print:${secret}`),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    ),
    encoder.encode(plainAddress(email)),
  );
  return Array.from(new Uint8Array(mac), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};
