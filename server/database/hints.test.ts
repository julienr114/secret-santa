import { describe, expect, it } from 'vitest';
import { testDb } from '../../tests/d1';
import { giverHelp } from './hints';

// The guard of ticket 165 (docs/spec/v3/migration.md, « Les pistes de
// cadeaux »): the hints left before the V3 stay read by the one who drew,
// whether the person has an account or not, unless the switch made a
// list of them.

const NOW = '2026-11-20T10:00:00.000Z';

const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ac', 'camille@x.fr', 'Camille', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille', '{}', 'ac', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1', 'p1', 2026, '2026-12-25', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, created_at) VALUES
  ('s1', 'p1', 'y1', 'Noël 2026', 'drawn', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('pi', 'p1', 'Inès', NULL, '${NOW}'),
  ('pc', 'p1', 'Camille', 'camille@x.fr', '${NOW}');
INSERT INTO participations (id, secret_santa_id, person_id, token_hash, token_enc, token_iv) VALUES
  ('pa-ines', 's1', 'pi', 'h1', 'x', 'x'),
  ('pa-camille', 's1', 'pc', 'h2', 'x', 'x');
INSERT INTO gift_portraits (participation_id, useful_or_surprising, lately, updated_at) VALUES
  ('pa-ines', 'first', 'Le tricot', '${NOW}');
INSERT INTO wishes (id, participation_id, position, label, url, created_at) VALUES
  ('w1', 'pa-ines', 0, 'Des aiguilles', NULL, '${NOW}'),
  ('w2', 'pa-camille', 0, 'Une lampe', NULL, '${NOW}');
`;

describe('giverHelp', () => {
  it('gives the old hints of someone without an address, then with an account', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(SETUP);
    const before = await giverHelp(db, {
      participationId: 'pa-ines',
      email: null,
    });
    expect(before.ideas.map((idea) => idea.label)).toEqual(['Des aiguilles']);
    expect(before.portrait.texts.lately).toBe('Le tricot');
    // She gets an address, then an account, with a « Moi » card that says
    // nothing yet: the one who drew her still reads her hints.
    sqlite.exec(`
UPDATE persons SET email = 'ines@x.fr' WHERE id = 'pi';
INSERT INTO accounts (id, email, first_name, created_at) VALUES ('ai', 'ines@x.fr', 'Inès', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, is_self, created_at) VALUES
  ('fi', 'ai', 'Inès', '🦊', 'pine', 1, '${NOW}');
`);
    const after = await giverHelp(db, {
      participationId: 'pa-ines',
      email: 'ines@x.fr',
    });
    expect(after.accountId).toBe('ai');
    expect(after.ideas.map((idea) => idea.label)).toEqual(['Des aiguilles']);
    expect(after.portrait.texts.lately).toBe('Le tricot');
  });

  it('does not give again the hints the switch made a list of', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(SETUP);
    sqlite.exec(`
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, created_at, updated_at) VALUES
  ('lc', 'ac', '🎁', 'pine', 'Famille', '${NOW}', '${NOW}');
UPDATE participations SET gift_list_id = 'lc' WHERE id = 'pa-camille';
`);
    const help = await giverHelp(db, {
      participationId: 'pa-camille',
      email: 'camille@x.fr',
    });
    expect(help.ideas).toEqual([]);
  });
});
