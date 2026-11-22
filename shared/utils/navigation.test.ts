import { describe, expect, it } from 'vitest';
import {
  backMove,
  hintsPathOf,
  listsPathOf,
  parentOf,
  invitationPathOf,
  partyPathOf,
  pastPathOf,
  placeOf,
  tabOf,
} from './navigation';

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

describe('invitationPathOf', () => {
  it('sends the old invitation link of an event and its word to its members', () => {
    expect(invitationPathOf('/e/famille/invitation')).toBe(
      '/e/famille/membres',
    );
    expect(invitationPathOf('/e/famille/invitation/')).toBe(
      '/e/famille/membres',
    );
    expect(invitationPathOf('/e/famille/invitation/mot')).toBe(
      '/e/famille/membres',
    );
  });

  it('leaves the other pages, and the link of a Secret Santa, alone', () => {
    expect(invitationPathOf('/e/famille/membres')).toBeNull();
    expect(
      invitationPathOf('/admin/famille/editions/e1/invitation'),
    ).toBeNull();
    expect(invitationPathOf('/invitation/abc')).toBeNull();
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
      '/e/famille/membres',
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

describe('hintsPathOf', () => {
  it('sends « Mes pistes », its pages and « Mes souhaits » to my list', () => {
    expect(hintsPathOf('/p/abc/pistes')).toBe('/p/abc/liste');
    expect(hintsPathOf('/p/abc/pistes/question')).toBe('/p/abc/liste');
    expect(hintsPathOf('/p/abc/souhaits')).toBe('/p/abc/liste');
  });

  it('leaves the rest of the personal page alone', () => {
    expect(hintsPathOf('/p/abc')).toBeNull();
    expect(hintsPathOf('/p/abc/journal')).toBeNull();
    expect(hintsPathOf('/p/abc/pistesx')).toBeNull();
  });
});

describe('pastPathOf', () => {
  it('sends « Tirages passés » to « Les événements passés »', () => {
    expect(pastPathOf('/tirages-passes')).toBe('/evenements-passes');
    expect(pastPathOf('/evenements-passes')).toBeNull();
  });
});

describe('listsPathOf', () => {
  it('sends the page of the old tab « Listes » home', () => {
    expect(listsPathOf('/listes')).toBe('/');
    expect(listsPathOf('/listes/')).toBe('/');
  });

  it('leaves the lists themselves where they are', () => {
    expect(listsPathOf('/listes/l1')).toBeNull();
    expect(listsPathOf('/listes/nouvelle')).toBeNull();
    expect(listsPathOf('/l/abc')).toBeNull();
  });
});

describe('placeOf', () => {
  it('reads the place of a page from its address, query or not', () => {
    expect(placeOf('/')).toBe('home');
    expect(placeOf('/quoi-de-neuf')).toBe('news');
    expect(placeOf('/offert-ailleurs')).toBe('elsewhere');
    expect(placeOf('/evenements-passes')).toBe('past');
    expect(placeOf('/e/noel')).toBe('event');
    expect(placeOf('/e/noel/annees/2025?depuis=evenement')).toBe('year');
    expect(placeOf('/listes/l1?nouvelle=1')).toBe('list');
    expect(placeOf('/l/abc?depuis=noel')).toBe('list');
    expect(placeOf('/p/tok')).toBe('draw');
    expect(placeOf('/famille')).toBe('people');
  });

  it('knows no other page, a child of a place included', () => {
    expect(placeOf('/e/nouvelle')).toBeNull();
    expect(placeOf('/e/noel/membres')).toBeNull();
    expect(placeOf('/listes/nouvelle?pour=noel')).toBeNull();
    expect(placeOf('/listes/l1/teneurs')).toBeNull();
    expect(placeOf('/famille/m1?liste=l1')).toBeNull();
    expect(placeOf('/p/tok/journal')).toBeNull();
    expect(placeOf('/compte')).toBeNull();
  });
});

// docs/spec/v3/navigation.md, « Retour », quand une page a plusieurs
// parents: one test a line.
describe('parentOf', () => {
  it('an event: the home or « Quoi de neuf », by default the home', () => {
    expect(parentOf('event', '/quoi-de-neuf', null, '/')).toBe('/quoi-de-neuf');
    expect(parentOf('event', '/', null, '/')).toBe('/');
    expect(parentOf('event', '/offert-ailleurs', null, '/')).toBe('/');
    expect(parentOf('event', null, null, '/')).toBe('/');
  });

  it('a list: the home, an event, « Quoi de neuf », « Ce que j’offre ailleurs », a past year, by default the home', () => {
    for (const from of [
      '/',
      '/e/noel',
      '/quoi-de-neuf',
      '/offert-ailleurs',
      '/e/noel/annees/2025?depuis=evenement',
    ]) {
      expect(parentOf('list', from, null, '/')).toBe(from);
    }
    expect(parentOf('list', '/p/tok', null, '/')).toBe('/');
    expect(parentOf('list', '/listes/l2', null, '/')).toBe('/');
    expect(parentOf('list', null, null, '/')).toBe('/');
  });

  it('my page of a Secret Santa: the home, its event, « Quoi de neuf », a past year, by default the home', () => {
    for (const from of [
      '/',
      '/e/noel',
      '/quoi-de-neuf',
      '/e/noel/annees/2025',
    ]) {
      expect(parentOf('draw', from, null, '/')).toBe(from);
    }
    expect(parentOf('draw', '/offert-ailleurs', null, '/')).toBe('/');
    expect(parentOf('draw', undefined, null, '/')).toBe('/');
  });

  it('the Secret Santa for its organiser: the home, its event, « Quoi de neuf », by default its event', () => {
    for (const from of ['/', '/e/noel', '/quoi-de-neuf']) {
      expect(parentOf('edition', from, null, '/e/noel')).toBe(from);
    }
    expect(parentOf('edition', '/e/noel/annees/2025', null, '/e/noel')).toBe(
      '/e/noel',
    );
    expect(parentOf('edition', null, null, '/e/noel')).toBe('/e/noel');
  });

  it('« Mes proches »: the list I come from, by default the home', () => {
    expect(parentOf('people', '/listes/l1', null, '/')).toBe('/listes/l1');
    expect(parentOf('people', '/', null, '/')).toBe('/');
    expect(parentOf('people', null, null, '/')).toBe('/');
  });

  it('one of my people: the list, my page of a Secret Santa or « Mes proches », by default « Mes proches »', () => {
    for (const from of ['/listes/l1', '/p/tok', '/famille']) {
      expect(parentOf('person', from, null, '/famille')).toBe(from);
    }
    expect(parentOf('person', '/', null, '/famille')).toBe('/famille');
    expect(parentOf('person', null, null, '/famille')).toBe('/famille');
  });

  it('a past year: « Les événements passés » or its event, by default « Les événements passés »', () => {
    for (const from of ['/evenements-passes', '/e/noel']) {
      expect(parentOf('year', from, null, '/evenements-passes')).toBe(from);
    }
    expect(parentOf('year', '/', null, '/evenements-passes')).toBe(
      '/evenements-passes',
    );
  });

  it('holds after a detour through one of its own pages', () => {
    // Event → list → its holders → list: « Retour », the event.
    expect(parentOf('list', '/listes/l1/teneurs', '/e/noel', '/')).toBe(
      '/e/noel',
    );
    expect(
      parentOf('list', '/famille/m1?liste=l1&place=p1', '/e/noel', '/'),
    ).toBe('/e/noel');
    // Nothing remembered: the default.
    expect(parentOf('list', '/listes/l1/teneurs', null, '/')).toBe('/');
  });

  it('forgets the parent remembered when coming from another place', () => {
    expect(parentOf('list', '/p/tok', '/e/noel', '/')).toBe('/');
    expect(parentOf('list', null, '/e/noel', '/')).toBe('/');
  });
});
