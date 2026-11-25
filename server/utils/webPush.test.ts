import { describe, expect, it } from 'vitest';
import { translateKey } from '#shared/i18n';
import { newsText } from '#shared/utils/news';
import {
  deviceGone,
  encryptForDevice,
  fromB64Url,
  pushMessageOf,
  toB64Url,
  vapidHeader,
} from './webPush';

const ec = { name: 'ECDH', namedCurve: 'P-256' } as const;

/** A device: its key pair and its secret, as a browser gives them. */
const aDevice = async () => {
  const keys = (await crypto.subtle.generateKey(ec, true, [
    'deriveBits',
  ])) as CryptoKeyPair;
  const p256dh = new Uint8Array(
    await crypto.subtle.exportKey('raw', keys.publicKey),
  );
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return {
    keys,
    given: { p256dh: toB64Url(p256dh), auth: toB64Url(auth) },
    p256dh,
    auth,
  };
};

const hkdf = async (
  salt: Uint8Array<ArrayBuffer>,
  ikm: Uint8Array<ArrayBuffer>,
  info: string | Uint8Array<ArrayBuffer>,
  length: number,
) =>
  new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: typeof info === 'string' ? new TextEncoder().encode(info) : info,
      },
      await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']),
      length * 8,
    ),
  );

/** What the device does with the body: RFC 8291, the other way. */
const decrypt = async (
  body: Uint8Array<ArrayBuffer>,
  device: Awaited<ReturnType<typeof aDevice>>,
) => {
  const salt = body.slice(0, 16);
  const keyLength = body[20]!;
  const senderPublic = body.slice(21, 21 + keyLength);
  const sealed = body.slice(21 + keyLength);
  const shared = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'ECDH',
        public: await crypto.subtle.importKey(
          'raw',
          senderPublic,
          ec,
          false,
          [],
        ),
      },
      device.keys.privateKey,
      256,
    ),
  );
  const info = new Uint8Array([
    ...new TextEncoder().encode('WebPush: info\0'),
    ...device.p256dh,
    ...senderPublic,
  ]);
  const ikm = await hkdf(device.auth, shared, info, 32);
  const cek = await hkdf(salt, ikm, 'Content-Encoding: aes128gcm\0', 16);
  const nonce = await hkdf(salt, ikm, 'Content-Encoding: nonce\0', 12);
  const plain = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']),
      sealed,
    ),
  );
  expect(plain.at(-1)).toBe(2);
  return new TextDecoder().decode(plain.slice(0, -1));
};

describe('encryptForDevice', () => {
  it('only the device reads the message', async () => {
    const device = await aDevice();
    const body = await encryptForDevice('{"title":"Noël"}', device.given);
    expect(new TextDecoder().decode(body)).not.toContain('Noël');
    expect(await decrypt(body, device)).toBe('{"title":"Noël"}');
  });
});

describe('vapidHeader', () => {
  it('signs a token for the push service, with the public key', async () => {
    const pair = (await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    )) as CryptoKeyPair;
    const publicKey = toB64Url(
      new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey)),
    );
    const { d } = await crypto.subtle.exportKey('jwk', pair.privateKey);
    const header = await vapidHeader(
      {
        endpoint: 'https://push.example.com/send/abc',
        subject: 'https://under-the-tree.party',
        publicKey,
        privateKey: d!,
      },
      1000,
    );
    const [, token, key] = /^vapid t=([^,]+), k=(.+)$/.exec(header)!;
    expect(key).toBe(publicKey);
    const [head, claims, signature] = token!.split('.');
    expect(JSON.parse(new TextDecoder().decode(fromB64Url(claims!)))).toEqual({
      aud: 'https://push.example.com',
      exp: 1000 + 12 * 60 * 60,
      sub: 'https://under-the-tree.party',
    });
    expect(
      await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        pair.publicKey,
        fromB64Url(signature!),
        new TextEncoder().encode(`${head}.${claims}`),
      ),
    ).toBe(true);
  });
});

describe('deviceGone', () => {
  it('forgets a device its push service no longer knows', () => {
    expect(deviceGone(410)).toBe(true);
    expect(deviceGone(404)).toBe(true);
    expect(deviceGone(429)).toBe(false);
  });
});

describe('pushMessageOf', () => {
  it('says the news as « Quoi de neuf » does, and opens its screen', () => {
    expect(
      pushMessageOf(
        {
          words: 'Quelqu’un te demande des idées de cadeaux',
          place: 'Famille Camille',
          to: '/p/abc',
        },
        3,
      ),
    ).toEqual({
      title: 'Famille Camille',
      body: 'Quelqu’un te demande des idées de cadeaux',
      url: '/p/abc',
      badge: 3,
    });
  });
});

describe('what a locked phone shows (ticket 124)', () => {
  it('never names whoever asks for ideas, nor the one drawn', () => {
    // The news that touch a draw say nobody's name, in every language:
    // a notification says only what its news says.
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      (['hint_request', 'receiver_ideas', 'envelope'] as const).forEach(
        (kind) => {
          const { key, params } = newsText({
            kind,
            count: 1,
            name: 'Camille',
            detail: null,
          });
          const words = translateKey(locale, key, params);
          expect(words, `${locale} ${kind}`).not.toContain('Camille');
          expect(
            pushMessageOf({ words, place: 'Famille', to: null }, 1).body,
          ).not.toContain('Camille');
        },
      );
    });
  });
});
