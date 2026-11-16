import { describe, expect, it } from 'vitest';
import { pageTitle } from './titles';

describe('pageTitle', () => {
  it('names the group and the edition', () => {
    expect(
      pageTitle(
        'Envoyer par email',
        ['Famille Camille', 'Noël 2026'],
        'Under the Tree',
      ),
    ).toBe('Envoyer par email — Famille Camille · Noël 2026');
  });

  it('names the group alone on a screen of the group', () => {
    expect(
      pageTitle('Nouvelle édition', ['Famille Camille'], 'Under the Tree'),
    ).toBe('Nouvelle édition — Famille Camille');
  });

  it('leaves out what is not known yet', () => {
    expect(
      pageTitle('Exclusions', [undefined, 'Noël 2026'], 'Under the Tree'),
    ).toBe('Exclusions — Noël 2026');
  });

  it('falls back on the app without any context', () => {
    expect(pageTitle('Exclusions', [null, ''], 'Under the Tree')).toBe(
      'Exclusions — Under the Tree',
    );
  });
});
