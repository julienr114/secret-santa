// The notifications of the phone (ticket 124, README 22.22), sent from the
// Worker without a third party: the standard of the browsers' push
// services. The app signs who it is (VAPID, RFC 8292, ES256), and the
// message is encrypted for the device alone (RFC 8291, aes128gcm): the
// push service carries it without reading it. Pure, but for the crypto
// of the platform.

const encoder = new TextEncoder();

/**
 * Bytes as base64url, without padding.
 * @param bytes - The bytes.
 * @returns The text.
 */
export const toB64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

/**
 * Bytes from base64url (or base64).
 * @param text - The text.
 * @returns The bytes.
 */
export const fromB64Url = (text: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(
    [
      ...atob(
        text.replaceAll('-', '+').replaceAll('_', '/') +
          '='.repeat((4 - (text.length % 4)) % 4),
      ),
    ].map((c) => c.charCodeAt(0)),
  );

const concat = (...parts: Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const out = new Uint8Array(parts.reduce((n, part) => n + part.length, 0));
  parts.reduce((at, part) => {
    out.set(part, at);
    return at + part.length;
  }, 0);
  return out;
};

/**
 * The private key of the app, from its two halves in base64url: the
 * public point (65 bytes, uncompressed) and the secret (32 bytes).
 * @param publicKey - The public key, as the browsers take it.
 * @param privateKey - The secret.
 * @returns The key that signs.
 */
const signingKey = (publicKey: string, privateKey: string) => {
  const point = fromB64Url(publicKey);
  return crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: toB64Url(point.slice(1, 33)),
      y: toB64Url(point.slice(33, 65)),
      d: privateKey,
      ext: true,
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
};

/**
 * The header that says who sends (VAPID): a token signed by the app for
 * the push service of the endpoint, good for twelve hours.
 * @param input - The endpoint, who to write to about the app, the keys.
 * @param input.endpoint - The address of the device at its push service.
 * @param input.subject - « mailto:… » or the app's address.
 * @param input.publicKey - The public key of the app.
 * @param input.privateKey - Its secret.
 * @param nowS - Now, in seconds.
 * @returns The value of `Authorization`.
 */
export const vapidHeader = async (
  input: {
    endpoint: string;
    subject: string;
    publicKey: string;
    privateKey: string;
  },
  nowS: number,
): Promise<string> => {
  const part = (value: object) =>
    toB64Url(encoder.encode(JSON.stringify(value)));
  const unsigned = `${part({ typ: 'JWT', alg: 'ES256' })}.${part({
    aud: new URL(input.endpoint).origin,
    exp: nowS + 12 * 60 * 60,
    sub: input.subject,
  })}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      await signingKey(input.publicKey, input.privateKey),
      encoder.encode(unsigned),
    ),
  );
  return `vapid t=${unsigned}.${toB64Url(signature)}, k=${input.publicKey}`;
};

const hkdf = async (
  salt: Uint8Array<ArrayBuffer>,
  ikm: Uint8Array<ArrayBuffer>,
  info: Uint8Array<ArrayBuffer>,
  length: number,
) =>
  new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']),
      length * 8,
    ),
  );

/** What a device gave when it subscribed. */
export type DeviceKeys = { p256dh: string; auth: string };

/**
 * A message encrypted for one device (RFC 8291, aes128gcm): a key drawn
 * for this message alone, agreed with the device's, so that only the
 * device reads it.
 * @param payload - The message, as text.
 * @param device - The keys of the device.
 * @param random - Random bytes, for the salt.
 * @returns The body to send.
 */
export const encryptForDevice = async (
  payload: string,
  device: DeviceKeys,
  random: (size: number) => Uint8Array<ArrayBuffer> = (size) =>
    crypto.getRandomValues(new Uint8Array(size)),
): Promise<Uint8Array<ArrayBuffer>> => {
  const devicePublic = fromB64Url(device.p256dh);
  const auth = fromB64Url(device.auth);
  const mine = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )) as CryptoKeyPair;
  const myPublic = new Uint8Array(
    await crypto.subtle.exportKey('raw', mine.publicKey),
  );
  const theirs = await crypto.subtle.importKey(
    'raw',
    devicePublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const shared = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: theirs },
      mine.privateKey,
      256,
    ),
  );
  const ikm = await hkdf(
    auth,
    shared,
    concat(encoder.encode('WebPush: info\0'), devicePublic, myPublic),
    32,
  );
  const salt = random(16);
  const cek = await hkdf(
    salt,
    ikm,
    encoder.encode('Content-Encoding: aes128gcm\0'),
    16,
  );
  const nonce = await hkdf(
    salt,
    ikm,
    encoder.encode('Content-Encoding: nonce\0'),
    12,
  );
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']),
      // The last (and only) record ends with 2.
      concat(encoder.encode(payload), new Uint8Array([2])),
    ),
  );
  const recordSize = new Uint8Array([0, 0, 16, 0]);
  return concat(salt, recordSize, new Uint8Array([65]), myPublic, sealed);
};

/** What a notification says, never more than a locked phone may show. */
export type PushMessage = {
  title: string;
  body: string;
  /** The screen it opens, a path of the app. */
  url: string;
  /** The news not seen yet, for the badge of the icon. */
  badge: number;
};

/**
 * Whether a device is gone: its push service answers that it no longer
 * knows it.
 * @param status - The status of the answer.
 * @returns True to forget the device.
 */
export const deviceGone = (status: number): boolean =>
  status === 404 || status === 410;

/**
 * The notification of a news: its place as the title (the event, or the
 * list), what happened as « Quoi de neuf » says it, and the screen it
 * opens. Only what a news holds: never a result of a draw, never who
 * asks for ideas.
 * @param news - The news, its place and where it opens.
 * @param news.words - What happened, already in the language of the account.
 * @param news.place - The event, or the list.
 * @param news.to - The screen it opens, or nothing.
 * @param badge - The news not seen yet.
 * @returns The notification.
 */
export const pushMessageOf = (
  news: { words: string; place: string; to: string | null },
  badge: number,
): PushMessage => ({
  title: news.place,
  body: news.words,
  url: news.to ?? '/quoi-de-neuf',
  badge,
});
