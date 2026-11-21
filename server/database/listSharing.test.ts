import { describe, expect, it } from 'vitest';
import { testDb } from '../../tests/d1';
import {
  claimersOf,
  memberWhereShared,
  membersSeeing,
  saveSharing,
  sharedEventsOf,
  sharingOptions,
} from './listSharing';

// The sharing of a list by stages on a real database (ticket 106): who
// is a member of an event it is shared in, what « Qui verra ta liste ? »
// offers and saves, who ticked.

const NOW = '2026-11-21T10:00:00.000Z';

const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ac', 'camille@x.fr', 'Camille', '${NOW}'),
  ('ah', 'hugo@x.fr', 'Hugo', '${NOW}'),
  ('al', 'lea@x.fr', 'Léa', '${NOW}'),
  ('ao', 'orga@x.fr', 'Orga', '${NOW}'),
  ('ax', 'inconnu@x.fr', 'Inconnu', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, from_list) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', 'ac', '${NOW}', 'christmas', 0),
  ('p2', 'mamie', 'Chez Mamie', '{}', 'ao', '${NOW}', 'christmas', 0),
  ('l1', 'liste-1', 'Ma liste', '{}', 'ac', '${NOW}', 'other', 1);
INSERT INTO party_organisers (party_id, account_id, created_at) VALUES
  ('p1', 'ac', '${NOW}'), ('p2', 'ao', '${NOW}'), ('l1', 'ac', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, active, created_at) VALUES
  ('c1', 'p1', 'Camille', 'camille@x.fr', 1, '${NOW}'),
  ('h1', 'p1', 'Hugo', 'hugo@x.fr', 1, '${NOW}'),
  ('l1p', 'p1', 'Léa', 'lea@x.fr', 0, '${NOW}'),
  ('i1', 'p1', 'Inès', NULL, 1, '${NOW}'),
  ('c2', 'p2', 'Camille', 'camille@x.fr', 1, '${NOW}'),
  ('l2', 'p2', 'Léa', 'lea@x.fr', 1, '${NOW}');
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, share_token, party_id, created_at, updated_at) VALUES
  ('l1', 'ac', '🎄', 'pine', 'Noël 2026', 'tok1', 'p1', '${NOW}', '${NOW}');
INSERT INTO gift_list_holders (id, list_id, account_id, level, created_at) VALUES
  ('hl1', 'l1', 'ac', 'manage', '${NOW}');
INSERT INTO gift_list_parties (id, list_id, party_id, visibility, created_at) VALUES
  ('own', 'l1', 'l1', 'party', '${NOW}'),
  ('in1', 'l1', 'p1', 'party', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, is_self, created_at) VALUES
  ('fc', 'ac', 'Camille', '🦌', 'pine', 1, '${NOW}');
INSERT INTO gift_list_people (id, list_id, member_id, position) VALUES
  ('lp', 'l1', 'fc', 0);
INSERT INTO gift_list_ideas (id, list_id, list_person_id, text, position, created_at) VALUES
  ('i-1', 'l1', 'lp', 'Un livre', 0, '${NOW}');
INSERT INTO gift_claims (id, list_id, idea_id, account_id, mode, created_at) VALUES
  ('cl1', 'l1', 'i-1', 'ah', 'alone', '${NOW}'),
  ('cl2', 'l1', 'i-1', 'al', 'group', '${NOW}');
`;

const setup = () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  return db;
};
const camille = { id: 'ac', email: 'camille@x.fr' };

describe('who gets in by an event', () => {
  it('lets in the active members and the organisers of an event it is shared in', async () => {
    const db = setup();
    expect(
      await memberWhereShared(db, 'l1', { id: 'ah', email: 'hugo@x.fr' }),
    ).toBe(true);
    // Léa left « Famille Camille »; she is in « Chez Mamie », not shared.
    expect(
      await memberWhereShared(db, 'l1', { id: 'al', email: 'lea@x.fr' }),
    ).toBe(false);
    expect(
      await memberWhereShared(db, 'l1', { id: 'ax', email: 'inconnu@x.fr' }),
    ).toBe(false);
  });
});

describe('« Qui verra ta liste ? »', () => {
  it('offers my events with their members, ticked where it is shared, never its own', async () => {
    const db = setup();
    expect(await sharingOptions(db, 'l1', camille)).toEqual([
      {
        id: 'p2',
        slug: 'mamie',
        name: 'Chez Mamie',
        category: 'christmas',
        emoji: '🎄',
        members: 2,
        checked: false,
      },
      {
        id: 'p1',
        slug: 'famille',
        name: 'Famille Camille',
        category: 'christmas',
        emoji: '🎄',
        members: 3,
        checked: true,
      },
    ]);
  });

  it('saves the events ticked and the public link, and keeps its own event', async () => {
    const db = setup();
    await saveSharing(
      db,
      { id: 'l1', sharedAt: null },
      { partyIds: ['p2'], isPublic: true },
      NOW,
    );
    expect(
      (await sharedEventsOf(db, 'l1')).map((row) => [row.id, row.visibility]),
    ).toEqual([['p2', 'party']]);
    const all = await db.query.giftListParties.findMany();
    expect(all.map((row) => row.partyId).toSorted()).toEqual(['l1', 'p2']);
    const [list] = await db.query.giftLists.findMany();
    expect(list?.sharedAt).toBe(NOW);
  });

  it('counts those who see it once each, its holders aside', async () => {
    const db = setup();
    expect(await membersSeeing(db, ['p1', 'p2'], ['camille@x.fr'])).toBe(3);
  });

  it('knows who ticked, once each', async () => {
    const db = setup();
    expect((await claimersOf(db, 'l1')).map((a) => a.id).toSorted()).toEqual([
      'ah',
      'al',
    ]);
  });
});
