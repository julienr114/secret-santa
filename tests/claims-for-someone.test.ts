import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { describe, expect, it } from 'vitest';

// « Cocher pour quelqu'un » (21 November 2026): nobody is told, by email
// or otherwise, when those who hold a list say who gives an idea, nor
// when a tick kept for an address becomes an account's. Whatever the
// route that saves the sheet « Qui l'offre ? » reaches, by its imports,
// never reaches the sending of an email nor a notice.

const ALIASES: Record<string, string> = {
  '#server/': 'server/',
  '#shared/': 'shared/',
};

/**
 * The file an import names, in the project; null for a package.
 * @param from - The file that imports.
 * @param spec - What it imports.
 * @returns The path, or null.
 */
const resolved = (from: string, spec: string): string | null => {
  const alias = Object.keys(ALIASES).find((prefix) => spec.startsWith(prefix));
  const base = alias
    ? ALIASES[alias]! + spec.slice(alias.length)
    : spec.startsWith('.')
      ? normalize(join(dirname(from), spec))
      : null;
  if (!base) return null;
  return (
    [base, `${base}.ts`, `${base}/index.ts`].find(
      (path) => existsSync(path) && path.endsWith('.ts'),
    ) ?? null
  );
};

/**
 * Every file of the project a file reaches by its imports, itself too.
 * @param start - The file.
 * @returns Their paths.
 */
const reached = (start: string): Set<string> => {
  const seen = new Set<string>();
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const [, spec] of source.matchAll(/from\s+'([^']+)'/g)) {
      const next = resolved(file, spec!);
      if (next) walk(next);
    }
  };
  walk(start);
  return seen;
};

describe('cocher pour quelqu’un', () => {
  it('sends no email and no notice, whoever is named', () => {
    const files = reached(
      'server/api/lists/[id]/claims/[ideaId]/givers.put.ts',
    );
    expect(files.has('server/http/claims.ts')).toBe(true);
    expect(files.has('server/database/claims.ts')).toBe(true);
    for (const file of files) {
      expect(file).not.toMatch(/server\/http\/(email|notify|listInvite)\.ts$/);
      expect(readFileSync(file, 'utf8')).not.toMatch(
        /sendEmails?\(|notifyOrganizers\(/,
      );
    }
  });
});
