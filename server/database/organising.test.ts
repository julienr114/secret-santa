import { describe, expect, it } from 'vitest';
import { testDb } from '../../tests/d1';
import { listOrganisedParties } from './organising';

// « Pour quelle occasion ? » of a Secret Santa on a real database (ticket
// 105): the parties I organise, never those I am only a member of, nor
// the party of a list.

const NOW = '2026-11-20T10:00:00.000Z';

const SETUP = `
INSERT INTO accounts (id, email, created_at) VALUES
  ('ao', 'orga@x.fr', '${NOW}'), ('ax', 'autre@x.fr', '${NOW}');
INSERT INTO parties (id, slug, name, rules, created_by, created_at, from_list) VALUES
  ('p', 'famille', 'Famille', '{}', 'ao', '${NOW}', 0),
  ('q', 'bureau', 'Bureau', '{}', 'ao', '${NOW}', 0),
  ('r', 'amis', 'Amis', '{}', 'ax', '${NOW}', 0),
  ('l', 'liste-x', 'Ma liste', '{}', 'ao', '${NOW}', 1);
INSERT INTO party_organisers (party_id, account_id, created_at) VALUES
  ('p', 'ao', '${NOW}'), ('q', 'ao', '${NOW}'), ('r', 'ax', '${NOW}'),
  ('l', 'ao', '${NOW}');
INSERT INTO persons (id, party_id, first_name, email, active, created_at) VALUES
  ('p1', 'p', 'Camille', 'orga@x.fr', 1, '${NOW}'),
  ('p2', 'p', 'Hugo', NULL, 1, '${NOW}'),
  ('p3', 'p', 'Tom', NULL, 0, '${NOW}'),
  ('r1', 'r', 'Camille', 'orga@x.fr', 1, '${NOW}');
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('p25', 'p', 2025, '2025-12-25', '${NOW}'),
  ('p26', 'p', 2026, '2026-12-25', '${NOW}'),
  ('q26', 'q', 2026, '2026-12-19', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, created_at) VALUES
  ('s1', 'p', 'p26', 'Noël 2026', 'drawn', '${NOW}'),
  ('s2', 'q', 'q26', 'Noël 2025', 'closed', '${NOW}');
UPDATE secret_santas SET year_id = 'q26' WHERE id = 's2';
`;

describe('listOrganisedParties', () => {
  it('offers the parties I organise, with their members and their year', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(SETUP);
    expect(await listOrganisedParties(db, 'ao')).toEqual([
      {
        slug: 'bureau',
        name: 'Bureau',
        category: 'christmas',
        iconEmoji: null,
        members: 0,
        hasSecretSanta: true,
      },
      {
        slug: 'famille',
        name: 'Famille',
        category: 'christmas',
        iconEmoji: null,
        members: 2,
        hasSecretSanta: true,
      },
    ]);
  });

  it('offers nothing to whom organises nothing', async () => {
    const { db, sqlite } = testDb();
    sqlite.exec(SETUP);
    expect(await listOrganisedParties(db, 'ax')).toHaveLength(1);
    expect(await listOrganisedParties(db, 'personne')).toEqual([]);
  });
});
