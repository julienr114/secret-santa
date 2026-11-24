import { describe, expect, it } from 'vitest';
import {
  linkLetsIn,
  listStage,
  losingClaimers,
  losingMembers,
  sharingAsk,
  sharingView,
  type Audience,
} from './listSharing';

const audience = (over: Partial<Audience> = {}): Audience => ({
  isPublic: false,
  emails: new Set(),
  accountIds: new Set(),
  ...over,
});

describe('listStage', () => {
  it('says the widest stage that applies', () => {
    expect(listStage({ isPublic: false, parties: 0, givers: 0 })).toBe('draft');
    expect(listStage({ isPublic: false, parties: 0, givers: 1 })).toBe('giver');
    expect(listStage({ isPublic: false, parties: 2, givers: 1 })).toBe(
      'parties',
    );
    expect(listStage({ isPublic: true, parties: 2, givers: 0 })).toBe('public');
  });
});

describe('linkLetsIn', () => {
  it('lets someone in once shared with an event, or open to everyone', () => {
    expect(linkLetsIn('draft')).toBe(false);
    // Only those who drew me: they come by their card, not by the link.
    expect(linkLetsIn('giver')).toBe(false);
    expect(linkLetsIn('parties')).toBe(true);
    expect(linkLetsIn('public')).toBe(true);
  });
});

describe('losingClaimers', () => {
  const lea = { id: 'a-lea', email: 'lea@x.fr' };
  const tom = { id: 'a-tom', email: 'tom@x.fr' };
  const me = { id: 'a-me', email: 'me@x.fr' };

  it('counts those who ticked, got in, and would no longer', () => {
    const before = audience({ emails: new Set([lea.email, tom.email]) });
    const after = audience({ emails: new Set([tom.email]) });
    expect(losingClaimers([lea, tom], [], before, after)).toBe(1);
  });

  it('never counts a holder, nor someone who keeps another way in', () => {
    const before = audience({ isPublic: true });
    const after = audience({
      emails: new Set([lea.email]),
      accountIds: new Set([tom.id]),
    });
    expect(losingClaimers([lea, tom, me], [me.id], before, after)).toBe(0);
  });

  it('counts everyone who ticked when a public list goes back to a draft', () => {
    expect(
      losingClaimers([lea, tom], [], audience({ isPublic: true }), audience()),
    ).toBe(2);
  });
});

describe('losingMembers', () => {
  it('counts the members who lose it, once each, holders and those still in aside', () => {
    const members = [
      { id: 'p1', email: 'me@x.fr' },
      { id: 'p2', email: 'hugo@x.fr' },
      { id: 'p3', email: 'hugo@x.fr' },
      { id: 'p4', email: null },
      { id: 'p5', email: 'tom@x.fr' },
    ];
    expect(
      losingMembers(
        members,
        ['me@x.fr'],
        audience({ emails: new Set(['tom@x.fr']) }),
      ),
    ).toBe(2);
    expect(
      losingMembers(members, ['me@x.fr'], audience({ isPublic: true })),
    ).toBe(0);
  });
});

describe('« Qui je veux » (ticket 139)', () => {
  const options = [
    { id: 'p1', shared: true, giver: true, drawn: true },
    { id: 'p2', shared: false, giver: false, drawn: true },
    { id: 'p3', shared: false, giver: false, drawn: false },
  ];

  it('shows those who see it, and offers the rest', () => {
    const view = sharingView(options, { onList: true, invite: true });
    expect(view.events.map((o) => o.id)).toEqual(['p1']);
    expect(view.givers.map((o) => o.id)).toEqual(['p1']);
    expect(view.addEvents.map((o) => o.id)).toEqual(['p2', 'p3']);
    expect(view.addGiver).toEqual(['p2']);
    expect(view.someoneElse).toBe(true);
    expect(view.nobody).toBe(false);
  });

  it('offers « Celui qui m’a tiré » only to who is on the list', () => {
    expect(
      sharingView(options, { onList: false, invite: false }).addGiver,
    ).toEqual([]);
  });

  it('knows a list nobody sees', () => {
    expect(
      sharingView(
        options.map((o) => ({ ...o, shared: false, giver: false })),
        { onList: true, invite: false },
      ).nobody,
    ).toBe(true);
  });

  it('saves the events and « Celui qui m’a tiré » apart', () => {
    expect(sharingAsk(options, false)).toEqual({
      parties: ['p1'],
      givers: ['p1'],
      isPublic: false,
    });
  });
});
