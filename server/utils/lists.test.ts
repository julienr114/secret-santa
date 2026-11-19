import { describe, expect, it } from 'vitest';
import {
  canResumeInto,
  resumeSummary,
  resumedList,
  LIST_EMOJIS,
  ageOn,
  cardSentence,
  carriedIdeas,
  daysUntil,
  ideaView,
  isWorthKeeping,
  listStatus,
  memberRemoval,
  noteOf,
  randomListIcon,
  shareChange,
  shareMissing,
  sortCards,
  splitIdea,
  type Claim,
} from './lists';

const claim = (over: Partial<Claim>): Claim => ({
  accountId: 'a',
  name: 'Mamie',
  avatar: { emoji: '🦊', color: 'plum' },
  mode: 'alone',
  anonymous: false,
  closed: false,
  createdAt: '2026-11-18T10:00:00Z',
  ...over,
});

describe('lists', () => {
  it('is a draft until shared, past after its day', () => {
    expect(listStatus({ sharedAt: null, eventDate: null }, '2026-11-18')).toBe(
      'draft',
    );
    expect(
      listStatus({ sharedAt: 'x', eventDate: '2026-12-25' }, '2026-11-18'),
    ).toBe('shared');
    expect(
      listStatus({ sharedAt: 'x', eventDate: '2026-12-25' }, '2026-12-25'),
    ).toBe('shared');
    expect(
      listStatus({ sharedAt: 'x', eventDate: '2026-12-25' }, '2026-12-26'),
    ).toBe('past');
    expect(listStatus({ sharedAt: 'x', eventDate: null }, '2030-01-01')).toBe(
      'shared',
    );
  });

  it('shares by a link kept from one sharing to the next', () => {
    const fresh = { token: 'new', now: 'now' };
    const never = { shareToken: null, sharedAt: null };
    const shared = { shareToken: 'old', sharedAt: 'then' };
    const stopped = { shareToken: 'old', sharedAt: null };
    // The first sharing makes the link.
    expect(shareChange(never, 'on', fresh)).toEqual({
      shareToken: 'new',
      sharedAt: 'now',
    });
    // Already shared: nothing moves.
    expect(shareChange(shared, 'on', fresh)).toEqual(shared);
    // Stopped: the link is kept; shared again, it is the same one.
    expect(shareChange(shared, 'off', fresh)).toEqual(stopped);
    expect(shareChange(stopped, 'on', fresh)).toEqual({
      shareToken: 'old',
      sharedAt: 'now',
    });
    // Another link, only while the list is shared.
    expect(shareChange(shared, 'renew', fresh)).toEqual({
      shareToken: 'new',
      sharedAt: 'then',
    });
    expect(shareChange(stopped, 'renew', fresh)).toEqual(stopped);
    expect(shareChange(never, 'off', fresh)).toEqual(never);
  });

  it('says what is missing to share, and keeps a document with something', () => {
    expect(shareMissing({ title: ' ', peopleCount: 0 })).toEqual([
      'title',
      'people',
    ]);
    expect(shareMissing({ title: 'Noël', peopleCount: 0 })).toEqual(['people']);
    expect(shareMissing({ title: 'Noël', peopleCount: 2 })).toEqual([]);
    expect(isWorthKeeping({ title: '', peopleCount: 0 })).toBe(false);
    expect(isWorthKeeping({ title: '', peopleCount: 1 })).toBe(true);
    expect(isWorthKeeping({ title: 'Noël', peopleCount: 0 })).toBe(true);
  });

  it('keeps the starting word until changed, and nothing once erased', () => {
    expect(noteOf(null, false)).toEqual({ kind: 'default' });
    expect(noteOf('  ', true)).toEqual({ kind: 'none' });
    expect(noteOf(null, true)).toEqual({ kind: 'none' });
    expect(noteOf('À vous !', true)).toEqual({
      kind: 'text',
      text: 'À vous !',
    });
  });

  it('turns an address pasted in a line into its link', () => {
    expect(
      splitIdea('Circuit de billes : https://exemple.fr/billes?x=1.'),
    ).toEqual({
      text: 'Circuit de billes',
      url: 'https://exemple.fr/billes?x=1',
    });
    expect(splitIdea('https://exemple.fr')).toEqual({
      text: '',
      url: 'https://exemple.fr',
    });
    expect(splitIdea('  Vélo   16 pouces ')).toEqual({
      text: 'Vélo 16 pouces',
      url: null,
    });
    expect(splitIdea('   ')).toBeNull();
  });

  it('shows the holder who gives, the others only that it is taken', () => {
    const holder = { accountId: 'h', holds: true };
    const other = { accountId: 'o', holds: false };
    expect(ideaView([], other)).toEqual({ kind: 'free' });
    expect(ideaView([claim({})], holder)).toEqual({
      kind: 'taken',
      by: 'Mamie',
    });
    expect(ideaView([claim({ anonymous: true })], holder)).toEqual({
      kind: 'taken',
      by: null,
    });
    expect(ideaView([claim({})], other)).toEqual({ kind: 'taken', by: null });
    expect(ideaView([claim({ accountId: 'o' })], other)).toEqual({
      kind: 'mine',
      mode: 'alone',
      anonymous: false,
    });
    expect(ideaView([claim({})], { accountId: null, holds: false })).toEqual({
      kind: 'taken',
      by: null,
    });
  });

  it('shows a gift given by several to everyone, led by its first', () => {
    const group = [
      claim({ accountId: 'b', name: 'Tonton', createdAt: '2026-11-19' }),
      claim({ accountId: 'a', name: 'Mamie', createdAt: '2026-11-18' }),
    ].map((c) => ({ ...c, mode: 'group' as const }));
    const view = ideaView(group, { accountId: 'b', holds: false });
    expect(view).toMatchObject({
      kind: 'group',
      closed: false,
      mine: true,
      leads: false,
    });
    expect(view.kind === 'group' && view.people.map((p) => p.name)).toEqual([
      'Mamie',
      'Tonton',
    ]);
    // The one who proposed it leaves: the next one leads.
    expect(
      ideaView(group.slice(0, 1), { accountId: 'b', holds: false }),
    ).toMatchObject({ kind: 'group', leads: true });
  });

  it('says what I give on a card, held or not', () => {
    expect(cardSentence({ planned: 9, mine: 2 }, true)).toEqual({
      key: 'planned',
      count: 9,
      mine: 2,
    });
    expect(cardSentence({ planned: 0, mine: 0 }, true)).toEqual({
      key: 'noneYet',
    });
    expect(cardSentence({ planned: 9, mine: 2 }, false)).toEqual({
      key: 'giving',
      count: 2,
    });
    expect(cardSentence({ planned: 9, mine: 0 }, false)).toEqual({
      key: 'nothingYet',
    });
  });

  it('carries over the ideas nobody gave, in their order', () => {
    expect(
      carriedIdeas([
        { text: 'B', url: null, position: 2, planned: false },
        { text: 'A', url: 'https://a', position: 1, planned: false },
        { text: 'C', url: null, position: 0, planned: true },
      ]),
    ).toEqual([
      { text: 'A', url: 'https://a' },
      { text: 'B', url: null },
    ]);
  });

  it('counts the days and the ages', () => {
    expect(daysUntil('2026-12-25', '2026-11-18')).toBe(37);
    expect(daysUntil('2026-11-18', '2026-11-18')).toBe(0);
    expect(ageOn('2020-03-14', '2026-11-18')).toBe(6);
    expect(ageOn('2020-11-19', '2026-11-18')).toBe(5);
    expect(ageOn('2020-11-18', '2026-11-18')).toBe(6);
  });

  it('ranges the cards by date, the past ones apart', () => {
    const card = (
      id: string,
      eventDate: string | null,
      status: 'draft' | 'shared' | 'past',
    ) => ({ id, eventDate, status, createdAt: '2026-11-01' });
    const { coming, past } = sortCards([
      card('none', null, 'draft'),
      card('feb', '2027-02-08', 'shared'),
      card('dec', '2026-12-24', 'shared'),
      card('old', '2026-03-12', 'past'),
      card('older', '2025-12-25', 'past'),
    ]);
    expect(coming.map((c) => c.id)).toEqual(['dec', 'feb', 'none']);
    expect(past.map((c) => c.id)).toEqual(['old', 'older']);
  });

  it('draws an icon among those of the lists', () => {
    const icon = randomListIcon(() => 0);
    expect(LIST_EMOJIS).toContain(icon.emoji);
    expect(new Set(LIST_EMOJIS).size).toBe(LIST_EMOJIS.length);
  });

  it('says what deleting a person of « Mes proches » takes, or refuses', () => {
    const other = { isSelf: false, holdsWithMe: false };
    // On no list: nothing else goes.
    expect(memberRemoval(other, [], new Set())).toEqual({
      allowed: true,
      lists: [],
      ideas: 0,
      planned: 0,
    });
    // On lists: they leave each, their ideas go, and the gifts planned
    // for them are lost, ticked ideas and gifts off the list alike.
    const places = [
      {
        list: { id: 'l1', title: 'Noël 2026' },
        ideaIds: ['a', 'b', 'c'],
        offList: 1,
      },
      { list: { id: 'l2', title: '' }, ideaIds: ['d'], offList: 0 },
    ];
    expect(memberRemoval(other, places, new Set(['a', 'd', 'zzz']))).toEqual({
      allowed: true,
      lists: [
        { id: 'l1', title: 'Noël 2026' },
        { id: 'l2', title: '' },
      ],
      ideas: 4,
      planned: 3,
    });
    // « Moi » stays, and so does whoever holds one of my lists with me.
    expect(
      memberRemoval({ isSelf: true, holdsWithMe: false }, places, new Set()),
    ).toEqual({ allowed: false, why: 'self' });
    expect(
      memberRemoval({ isSelf: false, holdsWithMe: true }, [], new Set()),
    ).toEqual({ allowed: false, why: 'holder' });
  });
});

describe('taking a list up again (lot 27)', () => {
  const idea = (text: string, position: number, planned = false) => ({
    text,
    url: null,
    position,
    planned,
  });
  const source = {
    icon: { emoji: '❄️', color: 'night' },
    note: 'Pas de peluches cette année',
    noteEdited: true,
    people: [
      {
        memberId: 'zoe',
        position: 1,
        ideas: [idea('Poupée en tissu', 0), idea('Livres cartonnés', 1, true)],
      },
      {
        memberId: 'leo',
        position: 0,
        ideas: [
          idea('Télescope', 1),
          idea('Circuit de billes', 2, true),
          idea('Livres sur les dinosaures', 0),
        ],
      },
      { memberId: 'hugo', position: 2, ideas: [] },
    ],
  };

  it('takes the icon, the word, the people in their order and the ideas nobody ticked', () => {
    const resumed = resumedList(source);
    expect(resumed.icon).toEqual({ emoji: '❄️', color: 'night' });
    expect(resumed.note).toBe('Pas de peluches cette année');
    expect(resumed.people.map((person) => person.memberId)).toEqual([
      'leo',
      'zoe',
      'hugo',
    ]);
    expect(resumed.people[0]?.ideas.map((i) => i.text)).toEqual([
      'Livres sur les dinosaures',
      'Télescope',
    ]);
    expect(resumed.people[1]?.ideas.map((i) => i.text)).toEqual([
      'Poupée en tissu',
    ]);
    // Someone without an idea left still comes.
    expect(resumed.people[2]?.ideas).toEqual([]);
  });

  it('leaves the starting word to come by itself', () => {
    const resumed = resumedList({ ...source, note: null, noteEdited: false });
    expect(resumed.note).toBeNull();
    expect(resumed.noteEdited).toBe(false);
    // A word the holder erased stays erased.
    expect(
      resumedList({ ...source, note: null, noteEdited: true }).noteEdited,
    ).toBe(true);
  });

  it('counts what it would bring', () => {
    expect(resumeSummary(source.people)).toEqual({ people: 3, ideas: 3 });
    expect(resumeSummary([])).toEqual({ people: 0, ideas: 0 });
  });

  it('only starts an empty draft from another list', () => {
    expect(canResumeInto({ sharedAt: null, peopleCount: 0 })).toBe(true);
    expect(canResumeInto({ sharedAt: null, peopleCount: 1 })).toBe(false);
    expect(
      canResumeInto({ sharedAt: '2026-11-19T10:00:00.000Z', peopleCount: 0 }),
    ).toBe(false);
  });
});
