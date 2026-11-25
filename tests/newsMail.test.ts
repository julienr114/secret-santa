import { describe, expect, it } from 'vitest';
import { testDb } from './d1';
import { encrypt } from '#server/utils/crypto';
import { addNews, markSeen, newsFor } from '#server/database/news';
import { sendNewsEmails } from '#server/database/newsMail';
import type { Email } from '#server/utils/messages';

// The emails of the news on a real database (ticket 121): three news in
// a day give one summary the next morning, none if seen in between; the
// envelope goes at once, whatever the choice but « Aucun email »; a run
// played again never sends twice.

const DAY = '2026-11-23T15:00:00.000Z';
const EVENING = '2026-11-23T18:00:00.000Z';
const MORNING = '2026-11-24T08:15:00.000Z';
const LATER = '2026-11-24T08:30:00.000Z';

const SETUP = `
INSERT INTO accounts (id, email, first_name, email_news, created_at) VALUES
  ('az', 'zoe@x.fr', 'Zoé', 'summary', '${DAY}'),
  ('ah', 'hugo@x.fr', 'Hugo', 'summary', '${DAY}'),
  ('an', 'nina@x.fr', 'Nina', 'none', '${DAY}'),
  ('ai', 'ines@x.fr', 'Inès', 'instant', '${DAY}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'az', '${DAY}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1', 'p1', 2026, '2026-12-25', '${DAY}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('z1', 'p1', 'Zoé', 'zoe@x.fr', '${DAY}'),
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', '${DAY}'),
  ('n1', 'p1', 'Nina', 'nina@x.fr', '${DAY}'),
  ('i1', 'p1', 'Inès', 'ines@x.fr', '${DAY}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, drawn_at, created_at) VALUES
  ('s1', 'p1', 'y1', 'Noël 2026', 'drawn', '${DAY}', '${DAY}');
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, share_token, created_at, updated_at) VALUES
  ('lz', 'az', '🎄', 'pine', 'Noël de Zoé', 'tokz', '${DAY}', '${DAY}');
INSERT INTO gift_list_holders (id, list_id, account_id, created_at) VALUES
  ('gz', 'lz', 'az', '${DAY}');
INSERT INTO gift_list_parties (id, list_id, party_id, visibility, created_at) VALUES
  ('k1', 'lz', 'p1', 'party', '${DAY}');
`;

const setup = async () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  for (const person of ['h1', 'n1', 'i1']) {
    const token = await encrypt(`jeton-${person}`, key);
    sqlite
      .prepare(
        `INSERT INTO participations (id, secret_santa_id, person_id, token_hash, token_enc, token_iv)
         VALUES (?, 's1', ?, ?, ?, ?)`,
      )
      .run(`p-${person}`, person, `hash-${person}`, token.enc, token.iv);
  }
  const sent: (Email & { to: string })[] = [];
  const run = (now: string) =>
    sendNewsEmails(db, {
      dataKey: key,
      now,
      url: (path) => `https://app.test${path}`,
      send: async (emails) => {
        sent.push(...emails);
      },
    });
  return { db, sent, run };
};

const ticked = (now: string) =>
  [
    newsFor(['az'], { kind: 'ticked', targetId: 'lz', partyId: null }),
    now,
  ] as const;

describe('the emails of the news', () => {
  it('gives three news of a day one summary the next morning', async () => {
    const { db, sent, run } = await setup();
    await addNews(db, ...ticked(DAY));
    await addNews(db, ...ticked(DAY));
    await addNews(
      db,
      newsFor(['az'], {
        kind: 'joined',
        targetId: 'p1',
        partyId: 'p1',
        name: 'Léa',
      }),
      EVENING,
    );
    expect(await run(EVENING)).toBe(0);
    expect(await run(MORNING)).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe('zoe@x.fr');
    expect(sent[0]!.subject).toBe('Under the Tree : 3 nouveautés depuis hier');
    expect(sent[0]!.text).toContain('Famille Camille');
    expect(sent[0]!.text).toContain('2 cadeaux ont été cochés sur ta liste');
    expect(sent[0]!.text).toContain('Léa s’inscrit par le lien');
    expect(sent[0]!.text).toContain('https://app.test/compte/me-prevenir');
    // Played again: nothing more.
    expect(await run(LATER)).toBe(0);
  });

  it('sends nothing for news seen in between', async () => {
    const { db, sent, run } = await setup();
    await addNews(db, ...ticked(DAY));
    await markSeen(
      db,
      { accountId: 'az', target: 'list', targetId: 'lz' },
      EVENING,
    );
    expect(await run(MORNING)).toBe(0);
    expect(sent).toHaveLength(0);
  });

  it('sends the envelope at once, but not to « Aucun email »', async () => {
    const { db, sent, run } = await setup();
    await addNews(
      db,
      newsFor(['ah', 'an'], {
        kind: 'envelope',
        targetId: 's1',
        partyId: 'p1',
      }),
      DAY,
    );
    expect(await run(DAY)).toBe(1);
    expect(sent[0]!.to).toBe('hugo@x.fr');
    expect(sent[0]!.subject).toBe('Famille Camille : ton enveloppe t’attend');
    expect(sent[0]!.text).toContain('https://app.test/p/jeton-h1');
    expect(await run(LATER)).toBe(0);
  });

  it('sends each news at once with « Tout de suite »', async () => {
    const { db, sent, run } = await setup();
    await addNews(
      db,
      newsFor(['ai'], { kind: 'revealed', targetId: 's1', partyId: 'p1' }),
      DAY,
    );
    expect(await run(DAY)).toBe(1);
    expect(sent[0]!.subject).toBe('Famille Camille : le tirage est dévoilé');
  });

  it('never mails a news the organiser did not want by email', async () => {
    const { db, sent, run } = await setup();
    await addNews(
      db,
      newsFor(['ai'], {
        kind: 'joined',
        targetId: 'p1',
        partyId: 'p1',
        name: 'Léa',
        mailable: false,
      }),
      DAY,
    );
    expect(await run(DAY)).toBe(0);
    expect(sent).toHaveLength(0);
  });

  it('sends a news counted again after it went', async () => {
    const { db, sent, run } = await setup();
    await addNews(
      db,
      newsFor(['ai'], { kind: 'ticked', targetId: 'lz', partyId: null }),
      DAY,
    );
    expect(await run(DAY)).toBe(1);
    await addNews(
      db,
      newsFor(['ai'], { kind: 'ticked', targetId: 'lz', partyId: null }),
      EVENING,
    );
    expect(await run(EVENING)).toBe(1);
    expect(sent.at(-1)!.subject).toContain('2 cadeaux ont été cochés');
  });
});
