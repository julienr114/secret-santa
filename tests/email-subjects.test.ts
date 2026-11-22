import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testDb } from './d1';
import { santaNameForSubject } from '../server/database/editions';

// Ticket 110. The subject of an email names a Secret Santa only when its
// event has several the same year, on a real database. And the request
// for ideas names nobody: its route reads no first name to send, and
// writes nothing in the journal.

const ROOT = join(__dirname, '..');
const NOW = '2026-11-01T00:00:00.000Z';

describe('santaNameForSubject', () => {
  const setup = () => {
    const { db, sqlite } = testDb();
    sqlite.exec(`
INSERT INTO parties (id, slug, name, rules, created_at, category, usual_date, recurring) VALUES
  ('p1', 'famille', 'Famille Camille', '{}', '${NOW}', 'christmas', '12-25', 1);
INSERT INTO party_years (id, party_id, year, date, created_at) VALUES
  ('y2025', 'p1', 2025, '2025-12-25', '${NOW}'),
  ('y2026', 'p1', 2026, '2026-12-25', '${NOW}');
INSERT INTO secret_santas (id, party_id, year_id, label, status, created_at) VALUES
  ('s2025', 'p1', 'y2025', 'Noël 2025', 'closed', '${NOW}'),
  ('s2025b', 'p1', 'y2025', 'Les enfants', 'closed', '${NOW}'),
  ('s2026', 'p1', 'y2026', 'Noël 2026', 'preparing', '${NOW}');
`);
    return db;
  };

  it('says nothing when the event has one Secret Santa that year', async () => {
    expect(
      await santaNameForSubject(setup(), {
        label: 'Noël 2026',
        yearId: 'y2026',
      }),
    ).toBeNull();
  });

  it('gives the name when the event has two that year', async () => {
    expect(
      await santaNameForSubject(setup(), {
        label: 'Les enfants',
        yearId: 'y2025',
      }),
    ).toBe('Les enfants');
  });
});

describe('the request for ideas', () => {
  const route = readFileSync(
    join(ROOT, 'server/api/p/[token]/hints/request.post.ts'),
    'utf8',
  );

  it('never reads the first name of who asks', () => {
    expect(route).not.toContain('firstName');
    expect(route).not.toContain('from:');
  });

  it('writes nothing in the journal', () => {
    expect(route).not.toContain('recordEvent');
    expect(route).not.toContain('auditLog');
  });
});
