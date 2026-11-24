import type { BlockCause } from './stopEmail';

// The returns of the email provider (ticket 130, README 22.25): an address
// that does not exist, or a complaint for junk mail, blocks the address
// at once. Its webhook signs each event (Svix, as Resend does): only a
// signature of the last five minutes counts. Pure, but for the hash.

/** How far a webhook's time may be from ours, in seconds. */
const TOLERANCE_S = 5 * 60;

const fromBase64 = (text: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array([...atob(text)].map((c) => c.charCodeAt(0)));

/**
 * Whether an event comes from the provider: its signature, by the secret
 * of the webhook, over its id, its time and its body.
 * @param input - The headers of the event, and its body as sent.
 * @param input.id - `svix-id`.
 * @param input.timestamp - `svix-timestamp`, in seconds.
 * @param input.signature - `svix-signature`: « v1,… », space separated.
 * @param input.body - The raw body.
 * @param secret - The secret of the webhook, « whsec_… ».
 * @param nowS - Now, in seconds.
 * @returns True when one of its signatures is the provider's.
 */
export const verifyProviderEvent = async (
  input: {
    id: string | undefined;
    timestamp: string | undefined;
    signature: string | undefined;
    body: string;
  },
  secret: string,
  nowS: number,
): Promise<boolean> => {
  const { id, timestamp, signature, body } = input;
  if (!secret || !id || !timestamp || !signature) return false;
  const time = Number(timestamp);
  if (!Number.isFinite(time) || Math.abs(nowS - time) > TOLERANCE_S) {
    return false;
  }
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      fromBase64(secret.replace(/^whsec_/, '')),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const mac = new Uint8Array(
      await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(`${id}.${timestamp}.${body}`),
      ),
    );
    const expected = btoa(String.fromCharCode(...mac));
    return signature.split(' ').some((part) => part.split(',')[1] === expected);
  } catch {
    return false;
  }
};

/** An event of the provider, as far as it matters here. */
export type ProviderEvent = {
  type?: string;
  data?: { to?: string[] | string; bounce?: { type?: string } };
};

/**
 * What an event of the provider blocks: the addresses of a bounce that
 * says they do not exist (not a mailbox full for a while), or of a
 * complaint.
 * @param event - The event.
 * @returns The addresses, and why; nothing for any other event.
 */
export const blocksOf = (
  event: ProviderEvent,
): { emails: string[]; cause: BlockCause } | null => {
  const to = event.data?.to;
  const emails = (Array.isArray(to) ? to : to ? [to] : []).filter(Boolean);
  if (emails.length === 0) return null;
  if (event.type === 'email.complained') return { emails, cause: 'complaint' };
  if (
    event.type === 'email.bounced' &&
    event.data?.bounce?.type !== 'Transient'
  ) {
    return { emails, cause: 'bounce' };
  }
  return null;
};
