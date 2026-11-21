import { describe, expect, it } from 'vitest';
import { backMove, partyPathOf, tabOf } from './navigation';

describe('backMove', () => {
  it('goes back when the page before is the parent', () => {
    expect(
      backMove('/admin/famille/editions/e1', '/admin/famille/editions/e1'),
    ).toBe('history');
  });

  it('opens the parent otherwise, whatever the history says', () => {
    // Opened from the home, the journal of a group still goes up to it.
    expect(backMove('/', '/admin/famille')).toBe('navigate');
    expect(backMove(null, '/admin/famille')).toBe('navigate');
    // The same page with another query is another place.
    expect(
      backMove(
        '/admin/famille/editions/e1',
        '/admin/famille/editions/e1?envoyer=p1',
      ),
    ).toBe('navigate');
  });
});

describe('partyPathOf', () => {
  it('sends the pages of a group to its party', () => {
    expect(partyPathOf('/admin/famille')).toBe('/e/famille');
    expect(partyPathOf('/admin/famille/')).toBe('/e/famille');
    expect(partyPathOf('/admin/famille/personnes')).toBe('/e/famille/membres');
    expect(partyPathOf('/admin/famille/personnes/p1')).toBe(
      '/e/famille/membres/p1',
    );
    expect(partyPathOf('/admin/famille/invitation/mot')).toBe(
      '/e/famille/invitation/mot',
    );
    expect(partyPathOf('/admin/famille/reglages')).toBe('/e/famille/reglages');
  });

  it('sends the addresses of before ticket 102 from /f to /e', () => {
    expect(partyPathOf('/f/famille')).toBe('/e/famille');
    expect(partyPathOf('/f/famille/membres/p1')).toBe('/e/famille/membres/p1');
    expect(partyPathOf('/f/nouvelle')).toBe('/e/nouvelle');
    expect(partyPathOf('/f')).toBe('/e');
  });

  it('leaves the editions, the administration and the rest alone', () => {
    expect(partyPathOf('/admin/famille/editions/e1')).toBeNull();
    expect(partyPathOf('/admin')).toBeNull();
    expect(partyPathOf('/admin/comptes')).toBeNull();
    expect(partyPathOf('/admin/groupes/nouveau')).toBeNull();
    expect(partyPathOf('/listes')).toBeNull();
  });
});

describe('tabOf', () => {
  it('puts every screen under « Accueil », a group included', () => {
    expect(tabOf('/')).toBe('home');
    expect(tabOf('/listes/l1')).toBe('home');
    expect(tabOf('/p/abc')).toBe('home');
    expect(tabOf('/admin/famille')).toBe('home');
    expect(tabOf('/admin/famille/editions/e1')).toBe('home');
  });

  it('gives « Quoi de neuf » and the super-admin’s pages their tab', () => {
    expect(tabOf('/quoi-de-neuf')).toBe('news');
    expect(tabOf('/admin')).toBe('admin');
    expect(tabOf('/admin/comptes')).toBe('admin');
    expect(tabOf('/admin/groupes/nouveau')).toBe('admin');
    expect(tabOf('/admin/guide-de-style')).toBe('admin');
  });
});
