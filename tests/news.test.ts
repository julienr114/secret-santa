import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { testDb } from './d1';
import { encrypt } from '#server/utils/crypto';
import { loadHome } from '#server/database/homeParties';
import {
  addNews,
  countUnseen,
  forgetNews,
  markKindSeen,
  markSeen,
  newsFor,
} from '#server/database/news';
import {
  tellAsked,
  tellNewIdeas,
  tellParticipants,
  tellTicked,
} from '#server/database/newsEvents';
import { loadNewsPage } from '#server/database/newsPage';
import { accounts, news } from '#server/database/schema';

// The news on a real database (ticket 120): written for the accounts it
// concerns, grouped in the day, seen by opening the thing, forgotten
// after thirty days; and never a result of a draw nor who asks for ideas,
// in a news or on the lines of the home (ticket 112).

const NOW = '2026-11-22T10:00:00.000Z';
const LATER = '2026-11-22T11:00:00.000Z';
const TODAY = '2026-11-22';

// Hugo draws Zoé; Camille draws Hugo and asks him for ideas; Inès is in
// the event and draws Camille; Zoé draws Inès. Zoé's list is shared with
// the event.
const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ah', 'hugo@x.fr', 'Hugo', '${NOW}'),
  ('ac', 'camille@x.fr', 'Camille', '${NOW}'),
  ('az', 'zoe@x.fr', 'Zoé', '${NOW}'),
  ('ai', 'ines@x.fr', 'Inès', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'ac', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_organisers (party_id, account_id, created_at) VALUES ('p1', 'ac', '${NOW}');
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1', 'p1', 2026, '2026-12-25', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', '${NOW}'),
  ('c1', 'p1', 'Camille', 'camille@x.fr', '${NOW}'),
  ('z1', 'p1', 'Zoé', 'zoe@x.fr', '${NOW}'),
  ('i1', 'p1', 'Inès', 'ines@x.fr', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, drawn_at, created_at) VALUES
  ('s1', 'p1', 'y1', 'Noël 2026', 'drawn', '${NOW}', '${NOW}');
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, share_token, created_at, updated_at) VALUES
  ('lz', 'az', '🎄', 'pine', 'Famille Camille', 'tokz', '${NOW}', '${NOW}'),
  ('ld', 'ai', '🎄', 'pine', 'Brouillon', 'tokd', '${NOW}', '${NOW}');
INSERT INTO gift_list_holders (id, list_id, account_id, created_at) VALUES
  ('gz', 'lz', 'az', '${NOW}'), ('gd', 'ld', 'ai', '${NOW}');
INSERT INTO gift_list_parties (id, list_id, party_id, visibility, created_at) VALUES
  ('k1', 'lz', 'p1', 'party', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, is_self, placeholder, created_at) VALUES
  ('fz', 'az', 'Zoé', '🦄', 'pine', 1, 0, '${NOW}');
INSERT INTO gift_list_people (id, list_id, member_id, position) VALUES ('pz', 'lz', 'fz', 0);
INSERT INTO gift_list_ideas (id, list_id, list_person_id, text, position, created_at) VALUES
  ('iz', 'lz', 'pz', 'Un télescope', 0, '${NOW}');
`;

/** Who gives to whom in s1. */
const PAIRS = [
  ['h1', 'z1'],
  ['c1', 'h1'],
  ['i1', 'c1'],
  ['z1', 'i1'],
] as const;

const setup = async () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  for (const [giver] of PAIRS) {
    const token = await encrypt(`jeton-${giver}`, key);
    sqlite
      .prepare(
        `INSERT INTO participations (id, secret_santa_id, person_id, token_hash, token_enc, token_iv, first_viewed_at)
         VALUES (?, 's1', ?, ?, ?, ?, '${NOW}')`,
      )
      .run(`p-${giver}`, giver, `hash-${giver}`, token.enc, token.iv);
  }
  for (const [giver, receiver] of PAIRS) {
    const sealed = await encrypt(receiver, key);
    sqlite
      .prepare(
        `INSERT INTO assignments (id, secret_santa_id, giver_person_id, receiver_enc, receiver_iv, created_at)
         VALUES (?, 's1', ?, ?, ?, '${NOW}')`,
      )
      .run(`a-${giver}`, giver, sealed.enc, sealed.iv);
  }
  const account = async (id: string) =>
    (await db.select().from(accounts).where(eq(accounts.id, id)))[0]!;
  return { db, sqlite, key, account };
};

/** Every news row, as plain text. */
const allNews = (sqlite: ReturnType<typeof testDb>['sqlite']) =>
  sqlite.prepare('SELECT * FROM news').all();

describe('writing news', () => {
  it('counts again one of the same kind at the same place the same day', async () => {
    const { db } = await setup();
    await addNews(
      db,
      newsFor(['az'], { kind: 'ticked', targetId: 'lz', partyId: null }),
      NOW,
    );
    await addNews(
      db,
      newsFor(['az'], { kind: 'ticked', targetId: 'lz', partyId: null }),
      LATER,
    );
    const rows = await db.select().from(news);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      count: 2,
      level: 'other',
      targetType: 'list',
    });
    expect(await countUnseen(db, 'az', LATER)).toBe(1);
  });

  it('is seen by opening the thing, and only that', async () => {
    const { db } = await setup();
    await tellParticipants(
      db,
      { secretSantaId: 's1', partyId: 'p1', kind: 'envelope' },
      NOW,
    );
    expect(await countUnseen(db, 'ah', NOW)).toBe(1);
    await markSeen(
      db,
      { accountId: 'ah', target: 'list', targetId: 's1' },
      NOW,
    );
    expect(await countUnseen(db, 'ah', NOW)).toBe(1);
    await markSeen(
      db,
      { accountId: 'ah', target: 'santa', targetId: 's1' },
      NOW,
    );
    expect(await countUnseen(db, 'ah', NOW)).toBe(0);
    // Everyone else still has theirs.
    expect(await countUnseen(db, 'ac', NOW)).toBe(1);
  });

  it('reading « Quoi de neuf » marks nothing', async () => {
    const { db, key, account } = await setup();
    await tellParticipants(
      db,
      { secretSantaId: 's1', partyId: 'p1', kind: 'envelope' },
      NOW,
    );
    const page = await loadNewsPage(db, await account('ah'), key, NOW);
    expect(page.sections).toHaveLength(1);
    expect(page.sections[0]).toMatchObject({
      key: 'p1',
      title: 'Famille Camille',
      category: 'christmas',
    });
    expect(page.sections[0]?.news[0]).toMatchObject({
      kind: 'envelope',
      seen: false,
      to: '/p/jeton-h1',
    });
    expect(await countUnseen(db, 'ah', NOW)).toBe(1);
  });

  it('forgets after thirty days', async () => {
    const { db } = await setup();
    await tellTicked(
      db,
      { listId: 'lz', by: 'ah' },
      '2026-10-01T10:00:00.000Z',
    );
    expect(await countUnseen(db, 'az', NOW)).toBe(0);
    await forgetNews(db, NOW);
    expect(await db.select().from(news)).toHaveLength(0);
  });

  it('tells those who hold a list of a tick, but who ticked', async () => {
    const { db } = await setup();
    await tellTicked(db, { listId: 'lz', by: 'ah' }, NOW);
    const rows = await db.select().from(news);
    expect(rows.map((row) => [row.accountId, row.kind, row.name])).toEqual([
      ['az', 'ticked', null],
    ]);
  });
});

describe('new ideas on a list', () => {
  it('tells the members, the one who drew its holder about their own Secret Santa, not its holder', async () => {
    const { db, key } = await setup();
    await tellNewIdeas(db, { listId: 'lz', by: 'az', dataKey: key }, NOW);
    const rows = await db.select().from(news);
    expect(
      rows
        .map((row) => [row.accountId, row.kind, row.targetId])
        .toSorted((a, b) => String(a[0]).localeCompare(String(b[0]))),
    ).toEqual([
      ['ac', 'new_ideas', 'lz'],
      // Hugo drew Zoé: told about his Secret Santa, not about her list.
      ['ah', 'receiver_ideas', 's1'],
      ['ai', 'new_ideas', 'lz'],
    ]);
  });

  it('tells nobody of a draft', async () => {
    const { db, key } = await setup();
    await tellNewIdeas(db, { listId: 'ld', by: 'ai', dataKey: key }, NOW);
    expect(await db.select().from(news)).toHaveLength(0);
  });
});

describe('never a result of a draw, never who asks for ideas', () => {
  it('in the news', async () => {
    const { db, sqlite, key } = await setup();
    // Camille asks Hugo for ideas; Zoé, whom Hugo drew, writes some.
    await tellAsked(
      db,
      { participationId: 'p-h1', secretSantaId: 's1', partyId: 'p1' },
      NOW,
    );
    await tellNewIdeas(db, { listId: 'lz', by: 'az', dataKey: key }, NOW);
    const hugo = allNews(sqlite).filter((row) => row.account_id === 'ah');
    expect(hugo.map((row) => row.kind).toSorted()).toEqual([
      'hint_request',
      'receiver_ideas',
    ]);
    for (const row of hugo) {
      // Every column but the row's own random id, which may hold « z1 » by chance.
      const { id: _id, ...columns } = row as Record<string, unknown>;
      const text = JSON.stringify(columns);
      expect(text).not.toContain('Camille');
      expect(text).not.toContain('Zoé');
      expect(text).not.toContain('c1');
      expect(text).not.toContain('z1');
    }
  });

  it('on the lines of the home', async () => {
    const { db, key, account } = await setup();
    await tellAsked(
      db,
      { participationId: 'p-h1', secretSantaId: 's1', partyId: 'p1' },
      NOW,
    );
    await tellNewIdeas(db, { listId: 'lz', by: 'az', dataKey: key }, NOW);
    const home = await loadHome(db, await account('ah'), key, TODAY, LATER);
    const famille = home.parties.find((party) => party.slug === 'famille')!;
    // The lines say that someone asks, and nothing of who.
    expect(famille.secretSantas[0]?.line).toEqual({
      parts: [{ key: 'lines.santa.asked' }],
      dot: true,
    });
    const santas = JSON.stringify(famille.secretSantas);
    expect(santas).not.toContain('Camille');
    expect(santas).not.toContain('Zoé');
    // Zoé's list says to Hugo what it says to Inès, who did not draw her.
    const ines = await loadHome(db, await account('ai'), key, TODAY, LATER);
    const line = (home_: typeof home) =>
      home_.parties
        .find((party) => party.slug === 'famille')!
        .lists.find((list) => list.id === 'lz')?.line;
    expect(line(home)).toEqual(line(ines));
  });

  it('opening my page shows what is next once the request is seen', async () => {
    const { db, key, account } = await setup();
    await tellAsked(
      db,
      { participationId: 'p-h1', secretSantaId: 's1', partyId: 'p1' },
      NOW,
    );
    await tellNewIdeas(db, { listId: 'lz', by: 'az', dataKey: key }, NOW);
    await markKindSeen(db, 'ah', 'hint_request', NOW);
    const home = await loadHome(db, await account('ah'), key, TODAY, LATER);
    expect(
      home.parties.find((party) => party.slug === 'famille')!.secretSantas[0]
        ?.line,
    ).toEqual({ parts: [{ key: 'lines.santa.receiverNews' }], dot: true });
  });
});
