import { describe, expect, it } from 'vitest';
import { ideaShort } from './ideaShort';

describe('ideaShort', () => {
  it('keeps the start of an idea', () => {
    expect(ideaShort('Circuit de billes, le grand modèle')).toBe(
      'Circuit de billes',
    );
    expect(ideaShort('Déguisement (taille 6 ans)')).toBe('Déguisement');
    expect(ideaShort('a'.repeat(50))).toBe(`${'a'.repeat(39)}…`);
  });
});
