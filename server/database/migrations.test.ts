import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { beforeAll, describe, expect, it } from 'vitest';
import { mergeRules } from '../utils/rules';
import { compareV3 } from './v3Compare';

// The V3 migration (ticket 101) on data of the V2: every migration up to
// 0032, then rows covering the cases of docs/spec/v3/migration.md, then
// 0033, in one transaction as D1 applies it, foreign keys on.

const DIR = join(__dirname, 'migrations');
const files = readdirSync(DIR)
  .filter((file) => file.endsWith('.sql'))
  .toSorted();
const V3 = '0033_v3_parties.sql';

type Row = Record<string, unknown>;

const apply = (db: DatabaseSync, file: string) => {
  db.exec('BEGIN');
  db.exec(readFileSync(join(DIR, file), 'utf8'));
  db.exec('COMMIT');
};

const all = (db: DatabaseSync, sql: string, ...params: string[]) =>
  db.prepare(sql).all(...params) as Row[];
const one = (db: DatabaseSync, sql: string, ...params: string[]) =>
  db.prepare(sql).get(...params) as Row;

const NOW = '2026-11-20T10:00:00.000Z';

const V2_DATA = `
INSERT INTO accounts (id, email, first_name, language, created_at) VALUES
  ('a1', 'camille@example.com', 'Camille', 'fr', '${NOW}'),
  ('a2', 'hugo@example.com', 'Hugo', 'en', '${NOW}'),
  ('a3', 'zoe@example.com', NULL, 'de', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, is_self, created_at) VALUES
  ('f3', 'a3', 'Zoé', '🦊', 'pine', 1, '${NOW}');

INSERT INTO groups (id, slug, name, rules, created_by, created_at) VALUES
  ('g1', 'famille', 'Famille', '{"excludePreviousYears":2,"wishlist":true,"eventDate":"2025-12-24","budget":null,"notifyJoined":false}', 'a1', '${NOW}'),
  ('g2', 'amis', 'Amis', '{}', 'a1', '${NOW}'),
  ('g3', 'vide', 'Vide', '{"messageNote":"Bises"}', 'a2', '${NOW}');
INSERT INTO group_members (group_id, account_id, created_at) VALUES
  ('g1', 'a1', '${NOW}'), ('g2', 'a1', '${NOW}'), ('g3', 'a2', '${NOW}');
INSERT INTO persons (id, group_id, first_name, email, created_at) VALUES
  ('p1', 'g1', 'Camille', 'camille@example.com', '${NOW}'),
  ('p2', 'g1', 'Inès', NULL, '${NOW}'),
  ('p3', 'g2', 'Camille', 'camille@example.com', '${NOW}'),
  ('p4', 'g2', 'Hugo', 'hugo@example.com', '${NOW}');
INSERT INTO manual_exclusions (id, group_id, giver_id, receiver_id) VALUES
  ('x1', 'g1', 'p1', 'p2');

INSERT INTO editions (id, group_id, label, year, status, rules_override, created_at) VALUES
  ('e1', 'g1', 'Noël 2025', 2025, 'closed', '{"budget":"30 €"}', '2025-11-01T00:00:00.000Z'),
  ('e2', 'g1', 'Noël 2026', 2026, 'drawn', '{"eventDate":"2026-12-24","wishlist":false,"budget":null}', '2026-11-01T00:00:00.000Z'),
  ('e3', 'g1', 'Les enfants 2026', 2026, 'preparing', NULL, '2026-11-02T00:00:00.000Z'),
  ('e4', 'g2', 'Noël 2024', 2024, 'closed', '{"eventDate":"24 décembre","giftHints":"ideas"}', '2024-11-01T00:00:00.000Z');
INSERT INTO participations (id, edition_id, person_id, token_hash, token_enc, token_iv, gift_list_id) VALUES
  ('pa1', 'e2', 'p1', 'h1', 'x', 'x', 'l1'),
  ('pa2', 'e2', 'p2', 'h2', 'x', 'x', NULL),
  ('pa3', 'e4', 'p3', 'h3', 'x', 'x', 'l1'),
  ('pa4', 'e4', 'p4', 'h4', 'x', 'x', 'l2');
INSERT INTO assignments (id, edition_id, giver_person_id, receiver_enc, receiver_iv, created_at) VALUES
  ('as1', 'e2', 'p1', 'x', 'x', '${NOW}');
INSERT INTO audit_log (id, group_id, edition_id, type, actor, created_at) VALUES
  ('au1', 'g1', 'e2', 'drawn', 'guardian', '${NOW}'),
  ('au2', 'g3', NULL, 'rules_changed', 'guardian', '${NOW}');

INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, event_date, share_token, created_at, updated_at) VALUES
  ('l1', 'a1', '🎄', 'pine', 'Ma liste', NULL, NULL, '${NOW}', '${NOW}'),
  ('l2', 'a2', '🎁', 'brick', 'Hugo', NULL, 'tok2', '${NOW}', '${NOW}'),
  ('l3', 'a1', '🎂', 'mustard', 'Les 7 ans de Léo', '2026-03-01', 'tok3', '2025-12-01T00:00:00.000Z', '${NOW}'),
  ('l4', 'a3', '❄️', 'night', '', NULL, NULL, '2025-06-01T00:00:00.000Z', '${NOW}');
INSERT INTO gift_list_holders (id, list_id, account_id, level, created_at) VALUES
  ('h1', 'l1', 'a1', 'manage', '${NOW}'),
  ('h3a', 'l3', 'a1', 'manage', '${NOW}'),
  ('h3b', 'l3', 'a2', 'write', '${NOW}');
`;

/** A database of the V2, with the rows above. */
const v2 = () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  files.filter((file) => file < V3).forEach((file) => apply(db, file));
  db.exec(V2_DATA);
  return db;
};

describe('the V3 migration', () => {
  const db = v2();
  const untouched = v2();
  const before: Record<string, { group: unknown; override: unknown }> = {};

  beforeAll(() => {
    all(
      db,
      'SELECT e.id, g.rules AS g, e.rules_override AS o FROM editions e JOIN groups g ON g.id = e.group_id',
    ).forEach((row) => {
      before[row.id as string] = {
        group: JSON.parse(row.g as string),
        override: row.o === null ? null : JSON.parse(row.o as string),
      };
    });
    apply(db, V3);
  });

  it('leaves no foreign key broken', () => {
    expect(all(db, 'PRAGMA foreign_key_check')).toEqual([]);
  });

  it('matches the Drizzle snapshot, table by table', () => {
    const snapshot = JSON.parse(
      readFileSync(join(DIR, 'meta', '0033_snapshot.json'), 'utf8'),
    ) as {
      tables: Record<
        string,
        { columns: Record<string, unknown>; indexes: Record<string, unknown> }
      >;
    };
    const tables = all(
      db,
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_%' ESCAPE '\\'",
    ).map((row) => row.name as string);
    expect(tables.toSorted()).toEqual(Object.keys(snapshot.tables).toSorted());
    Object.entries(snapshot.tables).forEach(([table, shape]) => {
      const columns = all(db, `PRAGMA table_info(\`${table}\`)`).map(
        (row) => row.name,
      );
      expect(columns.toSorted(), table).toEqual(
        Object.keys(shape.columns).toSorted(),
      );
      const indexes = all(db, `PRAGMA index_list(\`${table}\`)`)
        .filter((row) => row.origin === 'c')
        .map((row) => row.name);
      expect(indexes.toSorted(), table).toEqual(
        Object.keys(shape.indexes).toSorted(),
      );
    });
  });

  it('makes each group a Christmas party that comes back each year', () => {
    expect(
      all(
        db,
        "SELECT id, name, category, usual_date, recurring, from_list FROM parties WHERE id LIKE 'g%' ORDER BY id",
      ),
    ).toEqual(
      [
        ['g1', 'Famille'],
        ['g2', 'Amis'],
        ['g3', 'Vide'],
      ].map(([id, name]) => ({
        id,
        name,
        category: 'christmas',
        usual_date: '12-25',
        recurring: 1,
        from_list: 0,
      })),
    );
    expect(
      one(db, 'SELECT count(*) AS n FROM persons WHERE party_id = ?', 'g1').n,
    ).toBe(2);
    expect(one(db, 'SELECT party_id FROM manual_exclusions').party_id).toBe(
      'g1',
    );
    expect(
      all(
        db,
        'SELECT party_id, account_id FROM party_organisers WHERE party_id LIKE ? ORDER BY party_id',
        'g%',
      ),
    ).toEqual([
      { party_id: 'g1', account_id: 'a1' },
      { party_id: 'g2', account_id: 'a1' },
      { party_id: 'g3', account_id: 'a2' },
    ]);
  });

  it('puts each edition in the year of its party, with the date of that year', () => {
    expect(
      all(
        db,
        'SELECT s.id, s.label, s.status, y.party_id, y.year, y.date FROM secret_santas s JOIN party_years y ON y.id = s.year_id ORDER BY s.id',
      ),
    ).toEqual([
      {
        id: 'e1',
        label: 'Noël 2025',
        status: 'closed',
        party_id: 'g1',
        year: 2025,
        date: '2025-12-24',
      },
      {
        id: 'e2',
        label: 'Noël 2026',
        status: 'drawn',
        party_id: 'g1',
        year: 2026,
        date: '2026-12-24',
      },
      {
        id: 'e3',
        label: 'Les enfants 2026',
        status: 'preparing',
        party_id: 'g1',
        year: 2026,
        date: '2026-12-24',
      },
      {
        id: 'e4',
        label: 'Noël 2024',
        status: 'closed',
        party_id: 'g2',
        year: 2024,
        date: '2024-12-25',
      },
    ]);
    expect(
      one(db, "SELECT count(*) AS n FROM party_years WHERE party_id = 'g1'").n,
    ).toBe(2);
  });

  it('gives each Secret Santa the settings the group and the edition gave together', () => {
    const after = all(db, 'SELECT id, rules FROM secret_santas');
    expect(after).toHaveLength(4);
    after.forEach((row) => {
      const old = before[row.id as string]!;
      expect(
        mergeRules(JSON.parse(row.rules as string)),
        row.id as string,
      ).toEqual(mergeRules(old.group, old.override));
    });
    expect(
      mergeRules(
        JSON.parse(
          one(db, "SELECT rules FROM secret_santas WHERE id = 'e2'")
            .rules as string,
        ),
      ),
    ).toMatchObject({
      ok: true,
      value: {
        giftHints: 'none',
        excludePreviousYears: 2,
        eventDate: '2026-12-24',
      },
    });
  });

  it('keeps the rows that hang from a Secret Santa', () => {
    expect(
      all(db, 'SELECT id, secret_santa_id FROM participations ORDER BY id').map(
        (r) => r.secret_santa_id,
      ),
    ).toEqual(['e2', 'e2', 'e4', 'e4']);
    expect(
      one(db, 'SELECT secret_santa_id FROM assignments').secret_santa_id,
    ).toBe('e2');
    expect(
      all(db, 'SELECT party_id, secret_santa_id FROM audit_log ORDER BY id'),
    ).toEqual([
      { party_id: 'g1', secret_santa_id: 'e2' },
      { party_id: 'g3', secret_santa_id: null },
    ]);
  });

  it('puts a list linked to a draw in that party: for the party when public, else for the giver', () => {
    expect(
      all(
        db,
        "SELECT list_id, party_id, visibility FROM gift_list_parties WHERE list_id IN ('l1', 'l2') ORDER BY list_id, party_id",
      ),
    ).toEqual([
      { list_id: 'l1', party_id: 'g1', visibility: 'giver' },
      { list_id: 'l1', party_id: 'g2', visibility: 'giver' },
      { list_id: 'l2', party_id: 'g2', visibility: 'party' },
    ]);
  });

  it('gives every other list a party of its own, hidden from the screens of a group', () => {
    expect(
      all(
        db,
        'SELECT id, name, category, icon_emoji, icon_color, recurring, from_list, created_by FROM parties WHERE from_list = 1 ORDER BY id',
      ),
    ).toEqual([
      {
        id: 'l3',
        name: 'Les 7 ans de Léo',
        category: 'birthday',
        icon_emoji: '🎂',
        icon_color: 'mustard',
        recurring: 0,
        from_list: 1,
        created_by: 'a1',
      },
      {
        id: 'l4',
        name: '',
        category: 'other',
        icon_emoji: '❄️',
        icon_color: 'night',
        recurring: 0,
        from_list: 1,
        created_by: 'a3',
      },
    ]);
    expect(
      all(
        db,
        "SELECT party_id, year, date FROM party_years WHERE party_id IN ('l3', 'l4') ORDER BY party_id",
      ),
    ).toEqual([
      { party_id: 'l3', year: 2026, date: '2026-03-01' },
      { party_id: 'l4', year: 2025, date: null },
    ]);
    expect(
      all(
        db,
        "SELECT party_id, first_name, email, language FROM persons WHERE party_id IN ('l3', 'l4') ORDER BY party_id, email",
      ),
    ).toEqual([
      {
        party_id: 'l3',
        first_name: 'Camille',
        email: 'camille@example.com',
        language: 'fr',
      },
      {
        party_id: 'l3',
        first_name: 'Hugo',
        email: 'hugo@example.com',
        language: 'en',
      },
      {
        party_id: 'l4',
        first_name: 'Zoé',
        email: 'zoe@example.com',
        language: 'de',
      },
    ]);
    expect(
      all(
        db,
        "SELECT party_id, account_id FROM party_organisers WHERE party_id IN ('l3', 'l4') ORDER BY party_id",
      ),
    ).toEqual([
      { party_id: 'l3', account_id: 'a1' },
      { party_id: 'l4', account_id: 'a3' },
    ]);
    expect(
      all(
        db,
        "SELECT list_id, party_id, visibility FROM gift_list_parties WHERE list_id IN ('l3', 'l4') ORDER BY list_id",
      ),
    ).toEqual([
      { list_id: 'l3', party_id: 'l3', visibility: 'party' },
      { list_id: 'l4', party_id: 'l4', visibility: 'party' },
    ]);
  });

  it('passes the comparison of pnpm v3:compare', () => {
    expect(
      compareV3(
        (sql) => all(untouched, sql),
        (sql) => all(db, sql),
      ),
    ).toEqual([]);
  });

  it('makes the comparison see a draw that went missing', () => {
    const broken = v2();
    apply(broken, V3);
    broken.exec(
      "PRAGMA foreign_keys = OFF; UPDATE secret_santas SET status = 'closed' WHERE id = 'e2'; DELETE FROM gift_list_parties WHERE list_id = 'l4'",
    );
    expect(
      compareV3(
        (sql) => all(untouched, sql),
        (sql) => all(broken, sql),
      ),
    ).toEqual([
      'Secret Santa e2 : status a changé',
      'liste l4 : absente de la fête l4 (party)',
      'listes : 4 rattachements, 5 attendus',
    ]);
  });

  it('leaves every list in at least one party', () => {
    expect(
      one(
        db,
        'SELECT count(*) AS n FROM gift_lists WHERE id NOT IN (SELECT list_id FROM gift_list_parties)',
      ).n,
    ).toBe(0);
  });
});

describe('the end of the requests (ticket 105)', () => {
  const LIMIT = '0034_v3_secret_santa_limit.sql';
  const db = v2();
  db.exec(`
INSERT INTO group_requests (id, account_id, message, status, created_at) VALUES
  ('r1', 'a3', 'Pour ma famille', 'pending', '${NOW}');
UPDATE accounts SET group_quota = 5 WHERE id = 'a1';
`);
  files
    .filter((file) => file >= V3 && file <= LIMIT)
    .forEach((file) => apply(db, file));

  it('drops the requests, a pending one with them', () => {
    expect(
      all(db, "SELECT name FROM sqlite_master WHERE name = 'group_requests'"),
    ).toEqual([]);
  });

  it('gives every account the limit of 3 Secret Santa', () => {
    expect(
      all(db, 'SELECT DISTINCT secret_santa_limit AS n FROM accounts'),
    ).toEqual([{ n: 3 }]);
  });

  it('leaves no foreign key broken', () => {
    expect(all(db, 'PRAGMA foreign_key_check')).toEqual([]);
  });
});

describe('the sharing of a list by stages (ticket 106)', () => {
  const SHARING = '0036_v3_list_sharing.sql';
  const db = v2();
  // l2 is shared by link; l3, whose sharing was stopped, is linked to the
  // draw of « Famille » for Inès.
  db.exec(`
UPDATE gift_lists SET shared_at = '${NOW}' WHERE id = 'l2';
UPDATE participations SET gift_list_id = 'l3' WHERE id = 'pa2';
`);
  files
    .filter((file) => file >= V3 && file <= SHARING)
    .forEach((file) => apply(db, file));
  const rows = (list: string) =>
    all(
      db,
      'SELECT party_id AS party, visibility FROM gift_list_parties WHERE list_id = ? ORDER BY party_id',
      list,
    );

  it('gives every list its link, and keeps the links already sent', () => {
    expect(
      one(db, 'SELECT count(*) AS n FROM gift_lists WHERE share_token IS NULL')
        .n,
    ).toBe(0);
    expect(
      one(db, "SELECT share_token AS t FROM gift_lists WHERE id = 'l2'").t,
    ).toBe('tok2');
  });

  it('gives each list its occasion: its own event, or its draw’s', () => {
    const occasion = (id: string) =>
      one(db, 'SELECT party_id AS p FROM gift_lists WHERE id = ?', id).p;
    expect(['g1', 'g2']).toContain(occasion('l1'));
    expect(occasion('l2')).toBe('g2');
    expect(occasion('l3')).toBe('g1');
    expect(occasion('l4')).toBe('l4');
  });

  it('keeps a shared list public and in its event; an unshared one is a draft', () => {
    expect(rows('l2')).toEqual([{ party: 'g2', visibility: 'party' }]);
    expect(rows('l3')).toEqual([]);
    expect(
      one(db, "SELECT shared_at AS s FROM gift_lists WHERE id = 'l3'").s,
    ).toBeNull();
  });

  it('keeps « celui qui m’a tiré », and a list’s own event', () => {
    expect(rows('l1')).toEqual([
      { party: 'g1', visibility: 'giver' },
      { party: 'g2', visibility: 'giver' },
    ]);
    expect(rows('l4')).toEqual([{ party: 'l4', visibility: 'party' }]);
  });

  it('leaves no foreign key broken', () => {
    expect(all(db, 'PRAGMA foreign_key_check')).toEqual([]);
  });
});

describe('the gift hints become the list (ticket 107)', () => {
  const HINTS = '0037_v3_hints_to_lists.sql';
  const db = v2();
  // Camille, with an account, left a portrait and two ideas in « Les
  // enfants 2026 », still being prepared; Inès, without one, an idea in
  // « Noël 2026 ».
  db.exec(`
INSERT INTO participations (id, edition_id, person_id, token_hash, token_enc, token_iv) VALUES
  ('pa5', 'e3', 'p1', 'h5', 'x', 'x');
INSERT INTO gift_portraits (participation_id, useful_or_surprising, lately, updated_at) VALUES
  ('pa5', 'first', 'La course à pied', '${NOW}');
INSERT INTO wishes (id, participation_id, position, label, url, created_at) VALUES
  ('w1', 'pa5', 0, 'Une lampe de lecture', NULL, '${NOW}'),
  ('w2', 'pa5', 1, 'Des épices', 'https://epices.example', '${NOW}'),
  ('w3', 'pa2', 0, 'Un livre', NULL, '${NOW}');
`);
  const ideasBefore = all(db, 'SELECT label FROM wishes ORDER BY id');
  files
    .filter((file) => file >= V3 && file <= HINTS)
    .forEach((file) => apply(db, file));

  it('puts the portrait on the « Moi » card of the account', () => {
    const card = one(
      db,
      "SELECT answers, texts FROM family_members WHERE account_id = 'a1' AND is_self = 1",
    );
    expect(JSON.parse(String(card.answers)).usefulOrSurprising).toBe('first');
    expect(JSON.parse(String(card.texts)).lately).toBe('La course à pied');
  });

  it('puts the ideas on a list kept for the one who drew, in the draw’s event', () => {
    const [list] = all(
      db,
      "SELECT l.id, l.title, l.party_id FROM gift_lists l JOIN participations p ON p.gift_list_id = l.id WHERE p.id = 'pa5'",
    );
    expect(list).toMatchObject({ title: 'Famille', party_id: 'g1' });
    expect(
      all(
        db,
        'SELECT party_id AS party, visibility FROM gift_list_parties WHERE list_id = ?',
        String(list?.id),
      ),
    ).toEqual([{ party: 'g1', visibility: 'giver' }]);
    expect(
      all(
        db,
        'SELECT text, url FROM gift_list_ideas WHERE list_id = ? ORDER BY position',
        String(list?.id),
      ),
    ).toEqual([
      { text: 'Une lampe de lecture', url: null },
      { text: 'Des épices', url: 'https://epices.example' },
    ]);
    // Nobody else sees it: not public, in no event for all its members.
    expect(
      one(
        db,
        'SELECT shared_at AS s FROM gift_lists WHERE id = ?',
        String(list?.id),
      ).s,
    ).toBeNull();
  });

  it('creates nothing for a person without an account; the hints stay', () => {
    expect(all(db, 'SELECT label FROM wishes ORDER BY id')).toEqual(
      ideasBefore,
    );
    expect(
      one(db, "SELECT gift_list_id AS l FROM participations WHERE id = 'pa2'")
        .l,
    ).toBeNull();
  });

  it('leaves no foreign key broken, nor its working tables', () => {
    expect(all(db, 'PRAGMA foreign_key_check')).toEqual([]);
    expect(
      all(db, "SELECT name FROM sqlite_master WHERE name LIKE '_v3_hint%'"),
    ).toEqual([]);
  });
});
