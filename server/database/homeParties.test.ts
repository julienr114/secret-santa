import { describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { testDb } from '../../tests/d1';
import { encrypt } from '#server/utils/crypto';
import { loadHome } from './homeParties';
import { accounts } from './schema';

// The home on a real database (ticket 103): my parties, as a member or as
// their organiser, their Secret Santas of the year, the lists I may see.

const NOW = '2026-11-20T10:00:00.000Z';
const TODAY = '2026-11-20';

const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ah', 'hugo@x.fr', 'Hugo', '${NOW}'),
  ('ac', 'camille@x.fr', 'Camille', '${NOW}'),
  ('az', 'zoe@x.fr', 'Zoé', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'ac', '${NOW}', 'christmas', '12-25', 1),
  ('p2', 'bureau', 'Bureau', '{}', 'ah', '${NOW}', 'christmas', '12-19', 1),
  ('p3', 'ailleurs', 'Ailleurs', '{}', 'az', '${NOW}', 'birthday', '02-08', 1);
INSERT INTO party_organisers (party_id, account_id, created_at) VALUES
  ('p1', 'ac', '${NOW}'), ('p2', 'ah', '${NOW}'), ('p3', 'az', '${NOW}');
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1old', 'p1', 2025, '2025-12-25', '${NOW}'),
  ('y1', 'p1', 2026, '2026-12-25', '${NOW}'),
  ('y2', 'p2', 2026, '2026-12-19', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', '${NOW}'),
  ('c1', 'p1', 'Mamie Camille', 'camille@x.fr', '${NOW}'),
  ('z1', 'p1', 'Zoé', 'zoe@x.fr', '${NOW}'),
  ('z3', 'p3', 'Zoé', 'zoe@x.fr', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, created_at) VALUES
  ('sOld', 'p1', 'y1old', 'Noël 2025', '${NOW}'),
  ('s1', 'p1', 'y1', 'Noël 2026', '${NOW}'),
  ('s2', 'p2', 'y2', 'Noël 2026', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, is_self, placeholder, birth_date, created_at) VALUES
  ('fh', 'ah', 'Hugo', '🐧', 'pine', 1, 0, '1990-03-01', '${NOW}'),
  ('fz', 'ah', 'Zoé', '🦄', 'pine', 0, 0, '2022-12-14', '${NOW}'),
  ('fp', 'ah', '', '🎁', 'pine', 0, 1, NULL, '${NOW}');
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, share_token, created_at, updated_at) VALUES
  ('lh', 'ah', '🎄', 'pine', 'Celle de Hugo', NULL, '${NOW}', '${NOW}'),
  ('lc', 'ac', '🎄', 'pine', 'Celle de Camille', 'tokc', '${NOW}', '${NOW}'),
  ('lz', 'az', '🎄', 'pine', 'Celle de Zoé', 'tokz', '${NOW}', '${NOW}');
INSERT INTO gift_list_holders (id, list_id, account_id, created_at) VALUES
  ('gh', 'lh', 'ah', '${NOW}'), ('gc', 'lc', 'ac', '${NOW}'), ('gz', 'lz', 'az', '${NOW}');
INSERT INTO gift_list_parties (id, list_id, party_id, visibility, created_at) VALUES
  ('k1', 'lh', 'p1', 'party', '${NOW}'),
  ('k2', 'lc', 'p1', 'party', '${NOW}'),
  ('k3', 'lz', 'p1', 'giver', '${NOW}'),
  ('k4', 'lz', 'p3', 'party', '${NOW}');
`;

const setup = async () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  const token = await encrypt('jeton-hugo', key);
  sqlite
    .prepare(
      `INSERT INTO participations (id, secret_santa_id, person_id, token_hash, token_enc, token_iv)
       VALUES ('ph', 's1', 'h1', 'hash', ?, ?)`,
    )
    .run(token.enc, token.iv);
  const [hugo] = await db.select().from(accounts).where(eq(accounts.id, 'ah'));
  return { db, key, hugo: hugo! };
};

describe('loadHome', () => {
  it('gives my parties, as a member or as their organiser, and no other', async () => {
    const { db, key, hugo } = await setup();
    const home = await loadHome(db, hugo, key, TODAY);
    expect(home.parties.map((party) => party.slug).toSorted()).toEqual([
      'bureau',
      'famille',
    ]);
    const famille = home.parties.find((party) => party.slug === 'famille')!;
    expect(famille).toMatchObject({
      name: 'Famille Camille',
      category: 'christmas',
      date: '2026-12-25',
      prepare: null,
      resume: null,
    });
  });

  it('gives the Secret Santas of the year: mine by my link, the organiser’s by its page', async () => {
    const { db, key, hugo } = await setup();
    const home = await loadHome(db, hugo, key, TODAY);
    const bySlug = (slug: string) =>
      home.parties.find((party) => party.slug === slug)!;
    expect(bySlug('famille').secretSantas).toEqual([
      { id: 's1', label: 'Noël 2026', to: '/p/jeton-hugo' },
    ]);
    expect(bySlug('bureau').secretSantas).toEqual([
      { id: 's2', label: 'Noël 2026', to: '/admin/bureau/editions/s2' },
    ]);
  });

  it('gives the lists in the party, mine, never one kept for a giver', async () => {
    const { db, key, hugo } = await setup();
    const home = await loadHome(db, hugo, key, TODAY);
    const famille = home.parties.find((party) => party.slug === 'famille')!;
    expect(famille.lists).toEqual([
      { id: 'lh', mine: true, ownerName: 'Hugo', to: '/listes/lh' },
      {
        id: 'lc',
        mine: false,
        ownerName: 'Mamie Camille',
        to: '/l/tokc?depuis=famille',
      },
    ]);
  });

  it('gives my people with their birth dates, not the one that carries nobody', async () => {
    const { db, key, hugo } = await setup();
    const home = await loadHome(db, hugo, key, TODAY);
    expect(home.people.map((person) => person.id).toSorted()).toEqual([
      'fh',
      'fz',
    ]);
  });

  it('names the latest year over, and counts the others', async () => {
    const { db, key, hugo } = await setup();
    const home = await loadHome(db, hugo, key, TODAY);
    expect(home.past).toEqual({ latest: 'Famille Camille', others: 0 });
  });

  it('moves to the year after once the event is over, and offers to prepare it', async () => {
    const { db, key, hugo } = await setup();
    // Two weeks after Christmas, the Secret Santa of the office closed.
    await db.run(sql`UPDATE secret_santas SET status = 'closed'`);
    const home = await loadHome(db, hugo, key, '2027-10-30');
    const bureau = home.parties.find((party) => party.slug === 'bureau')!;
    expect(bureau).toMatchObject({
      date: '2027-12-19',
      prepare: 2027,
      secretSantas: [],
    });
    // Hugo does not organise Camille's: nothing to prepare there, and his
    // list of last year is offered again instead of being shown.
    const famille = home.parties.find((party) => party.slug === 'famille')!;
    expect(famille).toMatchObject({
      date: '2027-12-25',
      prepare: null,
      resume: 'lh',
      lists: [],
    });
    expect(home.past).toEqual({ latest: 'Famille Camille', others: 2 });
  });

  it('keeps an event whose Secret Santa is not closed, two weeks at most', async () => {
    const { db, key, hugo } = await setup();
    const kept = await loadHome(db, hugo, key, '2027-01-02');
    expect(kept.parties.find((party) => party.slug === 'famille')?.date).toBe(
      '2026-12-25',
    );
    const gone = await loadHome(db, hugo, key, '2027-01-09');
    expect(gone.parties.find((party) => party.slug === 'famille')?.date).toBe(
      '2027-12-25',
    );
  });
});
