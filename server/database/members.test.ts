import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// « Aucune route n'ajoute un membre à un événement sans passer par un
// Secret Santa ou une liste » (ticket 117). A member is a row of
// `persons`: every place of the server that writes one is listed here,
// with by where its member comes in. A new one fails this test until it
// goes through `enterParty` (server/database/members.ts), which keeps the
// way in.

const SERVER = join(__dirname, '..');

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : [];
  });

/** The files that write a member, and why each may. */
const ALLOWED: Record<string, string> = {
  // `enterParty`: by a Secret Santa or a list, kept in member_entries.
  'database/members.ts': 'by a Secret Santa or a list',
  // The definition of `insertPersonFromAccount`.
  'database/people.ts': 'the helper itself',
  // The one who creates an event is its first member (docs/spec/v3/
  // accueil-et-creation.md, « Une autre occasion »).
  'database/parties.ts': 'the creator of the event',
  // Those who hold a list are members of the event made for it, by it.
  'database/listParties.ts': 'by the list (kept in member_entries)',
  // Signing up by the link of a Secret Santa (ticket 116).
  'api/invite/[code]/join.post.ts': 'by the Secret Santa (joinSecretSanta)',
  // An organiser is a member of the event they organise: Q-031.
  'database/groups.ts': 'an organiser (Q-031)',
};

describe('nobody comes into an event but by a Secret Santa or a list', () => {
  const writers = sources(SERVER)
    .filter((path) =>
      /insert\(persons\)|insertPersonFromAccount\(/.test(
        readFileSync(path, 'utf8'),
      ),
    )
    .map((path) => relative(SERVER, path))
    .toSorted();

  it('writes a member only where the way in is known', () => {
    expect(writers).toEqual(Object.keys(ALLOWED).toSorted());
  });

  it('has no route that adds a person to an event alone', () => {
    const routes = sources(join(SERVER, 'api')).map((path) =>
      relative(SERVER, path),
    );
    expect(routes).not.toContain('api/admin/[slug]/persons/index.post.ts');
    expect(
      routes.filter((path) => /persons\/index\.post\.ts$/.test(path)),
    ).toEqual([]);
  });

  it('keeps the way in when someone signs up by a Secret Santa', () => {
    const invite = readFileSync(join(SERVER, 'database/invite.ts'), 'utf8');
    expect(invite).toContain('recordEntry(db');
  });
});
