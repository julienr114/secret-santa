import { describe, expect, it } from 'vitest';
import { testDb } from './d1';
import { myFollowedLists, saveFollow } from '#server/database/follows';
import { tellNewIdeas, tellPersonAdded } from '#server/database/newsEvents';

// Following a list, or one person of it, on a real database (ticket
// 122): an idea for Léo tells who follows Léo, not who follows Zoé; who
// follows the whole list hears of everything; who may no longer open the
// list hears of nothing.

const NOW = '2026-11-24T10:00:00.000Z';

// Camille holds « Noël 2026 », shared with all of Famille Camille: Léo
// and Zoé are on it. Hugo, Inès and Tom are members.
const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ac', 'camille@x.fr', 'Camille', '${NOW}'),
  ('ah', 'hugo@x.fr', 'Hugo', '${NOW}'),
  ('ai', 'ines@x.fr', 'Inès', '${NOW}'),
  ('at', 'tom@x.fr', 'Tom', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'ac', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y1', 'p1', 2026, '2026-12-25', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, active, created_at) VALUES
  ('c1', 'p1', 'Camille', 'camille@x.fr', 1, '${NOW}'),
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', 1, '${NOW}'),
  ('i1', 'p1', 'Inès', 'ines@x.fr', 1, '${NOW}'),
  ('t1', 'p1', 'Tom', 'tom@x.fr', 1, '${NOW}');
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, share_token, party_id, event_date, created_at, updated_at) VALUES
  ('l1', 'ac', '🎄', 'pine', 'Noël 2026', 'tok1', 'p1', '2026-12-25', '${NOW}', '${NOW}');
INSERT INTO gift_list_holders (id, list_id, account_id, created_at) VALUES ('g1', 'l1', 'ac', '${NOW}');
INSERT INTO gift_list_parties (id, list_id, party_id, visibility, created_at) VALUES
  ('k1', 'l1', 'p1', 'party', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, is_self, placeholder, created_at) VALUES
  ('fl', 'ac', 'Léo', '🚀', 'pine', 0, 0, '${NOW}'),
  ('fz', 'ac', 'Zoé', '🦄', 'pine', 0, 0, '${NOW}'),
  ('fm', 'ac', 'Mamie', '🦉', 'pine', 0, 0, '${NOW}');
INSERT INTO gift_list_people (id, list_id, member_id, position) VALUES
  ('leo', 'l1', 'fl', 0), ('zoe', 'l1', 'fz', 1);
`;

const setup = async () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  await saveFollow(
    db,
    { accountId: 'ah', listId: 'l1', choice: { list: false, people: ['leo'] } },
    NOW,
  );
  await saveFollow(
    db,
    { accountId: 'ai', listId: 'l1', choice: { list: true, people: [] } },
    NOW,
  );
  /** The news of an account, as `kind:name:count`. */
  const newsOf = (accountId: string) =>
    (
      sqlite
        .prepare(
          'SELECT kind, name, count FROM news WHERE account_id = ? ORDER BY kind',
        )
        .all(accountId) as {
        kind: string;
        name: string | null;
        count: number;
      }[]
    ).map((row) => `${row.kind}:${row.name ?? ''}:${row.count}`);
  const idea = (listPersonId: string) =>
    tellNewIdeas(
      db,
      { listId: 'l1', listPersonId, by: 'ac', dataKey: key },
      NOW,
    );
  return { db, sqlite, newsOf, idea };
};

describe('following a list', () => {
  it('tells who follows Léo of an idea for Léo, not of one for Zoé', async () => {
    const { newsOf, idea } = await setup();
    await idea('leo');
    await idea('leo');
    await idea('zoe');
    // The idea for Zoé is a dot in the app for Hugo, as for any reader.
    expect(newsOf('ah')).toEqual([
      'followed_ideas:Léo:2',
      'new_ideas:Camille:1',
    ]);
    // The whole list: by person, and by day.
    expect(newsOf('ai')).toEqual([
      'followed_ideas:Léo:2',
      'followed_ideas:Zoé:1',
    ]);
    // Tom follows nothing: the dot in the app only, never an email.
    expect(newsOf('at')).toEqual(['new_ideas:Camille:3']);
  });

  it('tells who follows the whole list of a person added', async () => {
    const { db, sqlite, newsOf } = await setup();
    sqlite.exec(
      "INSERT INTO gift_list_people (id, list_id, member_id, position) VALUES ('mamie', 'l1', 'fm', 2);",
    );
    await tellPersonAdded(
      db,
      { listId: 'l1', listPersonId: 'mamie', by: 'ac' },
      NOW,
    );
    expect(newsOf('ai')).toEqual(['followed_person:Mamie:1']);
    expect(newsOf('ah')).toEqual([]);
  });

  it('no longer tells who left the event', async () => {
    const { sqlite, newsOf, idea } = await setup();
    sqlite.exec("UPDATE persons SET active = 0 WHERE id = 'h1';");
    await idea('leo');
    expect(newsOf('ah')).toEqual([]);
  });

  it('no longer tells anyone once the list is shared with fewer', async () => {
    const { sqlite, newsOf, idea } = await setup();
    // Kept for the one who drew Camille only: Hugo may not open it.
    sqlite.exec(
      "UPDATE gift_list_parties SET visibility = 'giver' WHERE id = 'k1';",
    );
    await idea('leo');
    expect(newsOf('ah')).toEqual([]);
    expect(newsOf('ai')).toEqual([]);
  });

  it('lists what I follow, for « Me prévenir »', async () => {
    const { db } = await setup();
    expect(await myFollowedLists(db, 'ah')).toEqual([
      { listId: 'l1', title: 'Noël 2026', people: ['Léo'] },
    ]);
    expect(await myFollowedLists(db, 'ai')).toEqual([
      { listId: 'l1', title: 'Noël 2026', people: [] },
    ]);
  });
});
