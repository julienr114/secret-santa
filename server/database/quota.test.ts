import { describe, expect, it } from 'vitest';
import { testDb } from '../../tests/d1';
import { listOrganisedSecretSantas, quotaAccountOf } from './quota';

// The limit of 3 Secret Santa on a real database (ticket 105): what it
// counts is every Secret Santa not closed in a party the account
// organises, whoever created it.

const NOW = '2026-11-20T10:00:00.000Z';

const SETUP = `
INSERT INTO accounts (id, email, created_at) VALUES
  ('ao', 'orga@x.fr', '${NOW}'),
  ('ab', 'aussi@x.fr', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at) VALUES
  ('p', 'famille', 'Famille', '{}', 'ao', '${NOW}'),
  ('q', 'amis', 'Amis', '{}', 'ab', '${NOW}');
INSERT INTO party_organisers (party_id, account_id, created_at) VALUES
  ('p', 'ao', '${NOW}'), ('p', 'ab', '${NOW}'), ('q', 'ab', '${NOW}');
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('p25', 'p', 2025, '2025-12-25', '${NOW}'),
  ('p26', 'p', 2026, '2026-12-25', '${NOW}'),
  ('q26', 'q', 2026, '2026-12-25', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, created_at) VALUES
  ('s1', 'p', 'p25', 'Noël 2025', 'closed', '2025-11-01T00:00:00.000Z'),
  ('s2', 'p', 'p26', 'Les adultes', 'drawn', '2026-11-01T00:00:00.000Z'),
  ('s3', 'p', 'p26', 'Les enfants', 'preparing', '2026-11-02T00:00:00.000Z'),
  ('s4', 'q', 'q26', 'Noël 2026', 'preparing', '2026-11-03T00:00:00.000Z');
`;

const setup = () => {
  const { db, sqlite } = testDb();
  sqlite.exec(SETUP);
  return db;
};

describe('the Secret Santa an account organises', () => {
  it('counts those not closed, in every party it organises', async () => {
    const db = setup();
    const account = { isSuperAdmin: false, secretSantaLimit: 3 };
    expect(await quotaAccountOf(db, { ...account, id: 'ao' })).toEqual({
      ...account,
      organisedCount: 2,
    });
    expect(
      (await quotaAccountOf(db, { ...account, id: 'ab' })).organisedCount,
    ).toBe(3);
  });

  it('lists them oldest first, with their party and year', async () => {
    const db = setup();
    expect(await listOrganisedSecretSantas(db, 'ab')).toEqual([
      {
        id: 's2',
        label: 'Les adultes',
        status: 'drawn',
        year: 2026,
        partyName: 'Famille',
        partySlug: 'famille',
      },
      {
        id: 's3',
        label: 'Les enfants',
        status: 'preparing',
        year: 2026,
        partyName: 'Famille',
        partySlug: 'famille',
      },
      {
        id: 's4',
        label: 'Noël 2026',
        status: 'preparing',
        year: 2026,
        partyName: 'Amis',
        partySlug: 'amis',
      },
    ]);
  });
});
