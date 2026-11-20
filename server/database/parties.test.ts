import { describe, expect, it } from 'vitest';
import { testDb } from '../../tests/d1';
import { eq } from 'drizzle-orm';
import { createParty, leaveParty } from './parties';
import { accounts, parties, persons } from './schema';

// The party on a real database (ticket 104): leaving it, creating one.

const NOW = '2026-11-20T10:00:00.000Z';

const SETUP = `
INSERT INTO accounts (id, email, first_name, created_at) VALUES
  ('ao', 'orga@x.fr', 'Camille', '${NOW}'),
  ('am', 'membre@x.fr', 'Hugo', '${NOW}'),
  ('ax', 'autre@x.fr', 'Zoé', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, category, recurring) VALUES
  ('p', 'famille', 'Famille', '{}', 'ao', '${NOW}', 'christmas', 1),
  ('q', 'amis', 'Amis', '{}', 'ax', '${NOW}', 'christmas', 1);
INSERT INTO party_organisers (party_id, account_id, created_at) VALUES
  ('p', 'ao', '${NOW}'), ('q', 'ax', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, created_at) VALUES
  ('po', 'p', 'Camille', 'orga@x.fr', '${NOW}'),
  ('pm', 'p', 'Hugo', 'membre@x.fr', '${NOW}'),
  ('pt', 'p', 'Tom', NULL, '${NOW}'),
  ('qm', 'q', 'Hugo', 'membre@x.fr', '${NOW}'),
  ('qx', 'q', 'Zoé', 'autre@x.fr', '${NOW}');
INSERT INTO family_members (id, account_id, first_name, avatar_emoji, avatar_color, created_at) VALUES
  ('fo', 'ao', 'Camille', '🦌', 'pine', '${NOW}');
INSERT INTO gift_lists (id, account_id, icon_emoji, icon_color, title, share_token, created_at, updated_at) VALUES
  ('l1', 'am', '🎄', 'pine', 'Seule ici', NULL, '${NOW}', '${NOW}'),
  ('l2', 'am', '🎁', 'brick', 'Ici et ailleurs', NULL, '${NOW}', '${NOW}'),
  ('l3', 'ao', '🎄', 'pine', 'Celle de Camille', 'tok3', '${NOW}', '${NOW}');
INSERT INTO gift_list_holders (id, list_id, account_id, created_at) VALUES
  ('h1', 'l1', 'am', '${NOW}'), ('h2', 'l2', 'am', '${NOW}'), ('h3', 'l3', 'ao', '${NOW}');
INSERT INTO gift_list_parties (id, list_id, party_id, visibility, created_at) VALUES
  ('g1', 'l1', 'p', 'party', '${NOW}'),
  ('g2', 'l2', 'p', 'party', '${NOW}'),
  ('g3', 'l2', 'q', 'party', '${NOW}'),
  ('g4', 'l3', 'p', 'party', '${NOW}');
INSERT INTO gift_list_people (id, list_id, member_id, position) VALUES ('lp', 'l3', 'fo', 0);
INSERT INTO gift_list_ideas (id, list_id, list_person_id, text, position, created_at) VALUES
  ('i1', 'l3', 'lp', 'Un livre', 0, '${NOW}');
INSERT INTO gift_claims (id, list_id, idea_id, account_id, mode, created_at) VALUES
  ('c1', 'l3', 'i1', 'am', 'alone', '${NOW}');
`;

const setup = () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  const one = <T>(sql: string) => sqlite.prepare(sql).get() as T;
  const all = (sql: string) => sqlite.prepare(sql).all();
  /** Rows as the code gets them, through Drizzle. */
  const rows = {
    account: async (id: string) =>
      (await db.select().from(accounts).where(eq(accounts.id, id)))[0]!,
    party: async (id: string) =>
      (await db.select().from(parties).where(eq(parties.id, id)))[0]!,
    person: async (id: string) =>
      (await db.select().from(persons).where(eq(persons.id, id)))[0]!,
  };
  return { db, sqlite, one, all, rows };
};

describe('leaveParty', () => {
  it('takes my lists out of the party, keeps my ticks, and lets me go', async () => {
    const { db, one, all, rows } = setup();
    await leaveParty(
      db,
      {
        party: await rows.party('p'),
        account: await rows.account('am'),
        me: await rows.person('pm'),
      },
      NOW,
    );
    // My two lists left the party; the organiser's stays.
    expect(
      all("SELECT list_id FROM gift_list_parties WHERE party_id = 'p'"),
    ).toEqual([{ list_id: 'l3' }]);
    // The one in another party stays there; the one in no party gets its own.
    expect(
      all(
        "SELECT list_id, party_id FROM gift_list_parties WHERE list_id IN ('l1', 'l2') ORDER BY list_id",
      ),
    ).toEqual([
      { list_id: 'l1', party_id: 'l1' },
      { list_id: 'l2', party_id: 'q' },
    ]);
    expect(
      one("SELECT from_list, created_by FROM parties WHERE id = 'l1'"),
    ).toEqual({ from_list: 1, created_by: 'am' });
    // My ticks stay.
    expect(all("SELECT id FROM gift_claims WHERE account_id = 'am'")).toEqual([
      { id: 'c1' },
    ]);
    // I am no longer one of its people, but my person stays for the draws.
    expect(one("SELECT email, active FROM persons WHERE id = 'pm'")).toEqual({
      email: null,
      active: 0,
    });
    expect(one("SELECT email FROM persons WHERE id = 'qm'")).toEqual({
      email: 'membre@x.fr',
    });
  });
});

describe('createParty', () => {
  it('makes me its organiser and member, with the people I took, once each', async () => {
    const { db, one, all, rows } = setup();
    const slug = await createParty(
      db,
      await rows.account('ao'),
      {
        category: 'birthday',
        name: 'L’anniversaire de Léo',
        date: '2026-12-14',
        recurring: true,
        // Hugo and Tom from my party; Zoé is not in a party I organise.
        memberIds: ['pm', 'pt', 'qx'],
      },
      NOW,
    );
    expect(slug).toBe('l-anniversaire-de-leo');
    const party = one<{ id: string; usual_date: string; category: string }>(
      `SELECT id, usual_date, category FROM parties WHERE slug = '${slug}'`,
    );
    expect(party).toMatchObject({ usual_date: '12-14', category: 'birthday' });
    expect(
      all(
        `SELECT first_name, email FROM persons WHERE party_id = '${party.id}' ORDER BY first_name`,
      ),
    ).toEqual([
      { first_name: 'Camille', email: 'orga@x.fr' },
      { first_name: 'Hugo', email: 'membre@x.fr' },
      { first_name: 'Tom', email: null },
    ]);
    expect(
      all(
        `SELECT account_id FROM party_organisers WHERE party_id = '${party.id}'`,
      ),
    ).toEqual([{ account_id: 'ao' }]);
    expect(
      all(`SELECT year, date FROM party_years WHERE party_id = '${party.id}'`),
    ).toEqual([{ year: 2026, date: '2026-12-14' }]);
  });
});
