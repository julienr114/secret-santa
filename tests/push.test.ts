import { describe, expect, it } from 'vitest';
import { testDb } from './d1';
import { encrypt } from '#server/utils/crypto';
import { addNews, newsFor } from '#server/database/news';
import { sendNewsPushes, subscribeDevice } from '#server/database/push';
import { toB64Url } from '#server/utils/webPush';

// The notifications of the phone on a real database (ticket 124): what
// presses goes once to each phone of the account; the rest does not go;
// a phone its push service no longer knows is forgotten.

const NOW = '2026-11-25T10:00:00.000Z';
const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ah', 'hugo@x.fr', 'Hugo', '${NOW}'),
  ('az', 'zoe@x.fr', 'Zoé', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'ah', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1', 'p1', 2026, '2026-12-25', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, drawn_at, created_at) VALUES
  ('s1', 'p1', 'y1', 'Noël 2026', 'drawn', '${NOW}', '${NOW}');
`;

const setup = async () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  const token = await encrypt('jeton-h1', key);
  sqlite
    .prepare(
      `INSERT INTO participations (id, secret_santa_id, person_id, token_hash, token_enc, token_iv)
       VALUES ('p-h1', 's1', 'h1', 'hash-h1', ?, ?)`,
    )
    .run(token.enc, token.iv);
  const device = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )) as CryptoKeyPair;
  await subscribeDevice(
    db,
    {
      accountId: 'ah',
      endpoint: 'https://push.example.com/hugo',
      keys: {
        p256dh: toB64Url(
          new Uint8Array(
            await crypto.subtle.exportKey('raw', device.publicKey),
          ),
        ),
        auth: toB64Url(crypto.getRandomValues(new Uint8Array(16))),
      },
    },
    NOW,
  );
  const signing = (await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign'],
  )) as CryptoKeyPair;
  const vapid = {
    publicKey: toB64Url(
      new Uint8Array(await crypto.subtle.exportKey('raw', signing.publicKey)),
    ),
    privateKey: (await crypto.subtle.exportKey('jwk', signing.privateKey)).d!,
    subject: 'https://app.test',
  };
  const posted: { endpoint: string; headers: Record<string, string> }[] = [];
  const run = (status = 201) =>
    sendNewsPushes(db, {
      dataKey: key,
      now: NOW,
      vapid,
      post: async (endpoint, headers) => {
        posted.push({ endpoint, headers });
        return status;
      },
    });
  return { db, sqlite, posted, run };
};

describe('the notifications of the phone', () => {
  it('sends what presses once to the phone of the account', async () => {
    const { db, posted, run } = await setup();
    await addNews(
      db,
      newsFor(['ah', 'az'], {
        kind: 'envelope',
        targetId: 's1',
        partyId: 'p1',
      }),
      NOW,
    );
    // The rest does not go to the phone.
    await addNews(
      db,
      newsFor(['ah'], { kind: 'revealed', targetId: 's1', partyId: 'p1' }),
      NOW,
    );
    expect(await run()).toBe(1);
    expect(posted).toHaveLength(1);
    expect(posted[0]!.endpoint).toBe('https://push.example.com/hugo');
    expect(posted[0]!.headers['Content-Encoding']).toBe('aes128gcm');
    expect(posted[0]!.headers.Authorization).toMatch(/^vapid t=.+, k=.+$/);
    // Once.
    expect(await run()).toBe(0);
  });

  it('forgets a phone its push service no longer knows', async () => {
    const { db, sqlite, run } = await setup();
    await addNews(
      db,
      newsFor(['ah'], { kind: 'envelope', targetId: 's1', partyId: 'p1' }),
      NOW,
    );
    await run(410);
    expect(
      sqlite.prepare('SELECT count(*) AS n FROM push_subscriptions').get(),
    ).toEqual({ n: 0 });
  });
});
