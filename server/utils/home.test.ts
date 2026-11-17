import { describe, expect, it } from 'vitest';
import {
  groupCards,
  homeLayout,
  pastDrawsByYear,
  pickHomeAction,
  type HomeDrawState,
  type HomeEditionState,
  type HomeGroupState,
  type HomeState,
} from './home';

const TODAY = '2026-12-10';

const draw = (over: Partial<HomeDrawState> = {}): HomeDrawState => ({
  id: 'p1',
  path: '/p/token1',
  groupId: 'g1',
  groupName: 'Famille Martin',
  editionLabel: 'Noël 2026',
  status: 'drawn',
  revealed: true,
  hintsOn: true,
  hasHints: true,
  receiverHints: 'none',
  answer: null,
  eventDate: '2026-12-24',
  ...over,
});
const edition = (over: Partial<HomeEditionState> = {}): HomeEditionState => ({
  id: 'e1',
  label: 'Noël 2026',
  status: 'drawn',
  participants: 6,
  toNotify: 0,
  notOpened: 0,
  viewed: 6,
  eventDate: '2026-12-24',
  drawPossible: null,
  answers: null,
  ...over,
});
const group = (
  over: Partial<HomeGroupState> = {},
  current: HomeEditionState | null = edition(),
): HomeGroupState => ({
  id: 'g1',
  slug: 'famille-martin',
  name: 'Famille Martin',
  current,
  ...over,
});
const home = (over: Partial<HomeState> = {}): HomeState => ({
  role: 'member',
  firstName: 'Léa',
  draws: [],
  groups: [],
  canCreateGroup: false,
  pendingRequests: 0,
  ...over,
});
const kindOf = (state: HomeState, today = TODAY, dismissed: string[] = []) =>
  pickHomeAction(state, today, dismissed)?.kind ?? null;

describe('pickHomeAction, one rank at a time (README 22.10)', () => {
  it('1. an organiser with people still to notify after the draw', () => {
    const action = pickHomeAction(
      home({ groups: [group({}, edition({ toNotify: 3 }))] }),
      TODAY,
    );
    expect(action).toEqual({
      kind: 'notify',
      groupName: 'Famille Martin',
      count: 3,
      to: '/admin/famille-martin/editions/e1/emails?type=drawn',
      dismissKey: null,
    });
  });

  it('2. a super-admin with group requests to answer', () => {
    const action = pickHomeAction(
      home({ role: 'super_admin', pendingRequests: 2 }),
      TODAY,
    );
    expect(action).toMatchObject({
      kind: 'requests',
      count: 2,
      to: '/admin',
    });
    expect(kindOf(home({ role: 'member', pendingRequests: 2 }))).toBeNull();
  });

  it('3. a participant whose draw is done and not discovered yet', () => {
    expect(
      pickHomeAction(home({ draws: [draw({ revealed: false })] }), TODAY),
    ).toMatchObject({ kind: 'discover', to: '/p/token1', dismissKey: null });
  });

  it('3 bis. new hints from the person they give to, before anything else of theirs', () => {
    expect(
      pickHomeAction(
        home({ draws: [draw({ receiverHints: 'new', hasHints: false })] }),
        TODAY,
      ),
    ).toMatchObject({ kind: 'readHints', to: '/p/token1', dismissKey: null });
    // Hints read, or not new: no card.
    expect(
      kindOf(home({ draws: [draw({ receiverHints: 'some' })] })),
    ).toBeNull();
    // Discovering comes first, on another draw.
    expect(
      kindOf(
        home({
          draws: [
            draw({ receiverHints: 'new' }),
            draw({ id: 'p2', path: '/p/token2', revealed: false }),
          ],
        }),
      ),
    ).toBe('discover');
    // Not after the edition is closed.
    expect(
      kindOf(
        home({ draws: [draw({ receiverHints: 'new', status: 'closed' })] }),
      ),
    ).toBeNull();
  });

  it('3 ter. their answer to a draw made elsewhere, before their hints', () => {
    const state = home({
      draws: [draw({ status: 'preparing', answer: 'toGive', hasHints: false })],
    });
    expect(pickHomeAction(state, TODAY)).toMatchObject({
      kind: 'giveAnswer',
      to: '/p/token1',
      dismissKey: null,
    });
    // Given: only the hints are left to leave.
    expect(
      kindOf(
        home({
          draws: [
            draw({ status: 'preparing', answer: 'given', hasHints: false }),
          ],
        }),
      ),
    ).toBe('addHints');
  });

  it('5 bis and 6 bis. the answers of a draw made elsewhere', () => {
    const state = (card: 'collect' | 'conflict' | 'oneMissing' | 'ready') =>
      home({
        groups: [
          group(
            {},
            edition({
              status: 'preparing',
              participants: 5,
              answers: { card, answered: 4 },
            }),
          ),
        ],
      });
    expect(kindOf(state('conflict'))).toBe('fixAnswers');
    expect(kindOf(state('ready'))).toBe('validateAnswers');
    expect(kindOf(state('oneMissing'))).toBe('validateAnswers');
    expect(pickHomeAction(state('collect'), TODAY)).toMatchObject({
      kind: 'askAnswers',
      count: 1,
      to: '/admin/famille-martin/editions/e1',
    });
  });

  it('4. everyone notified, the party within 7 days, links still unopened', () => {
    const state = (eventDate: string) =>
      home({ groups: [group({}, edition({ notOpened: 2, eventDate }))] });
    expect(kindOf(state('2026-12-17'))).toBe('remind');
    expect(kindOf(state('2026-12-18'))).toBeNull();
    expect(pickHomeAction(state('2026-12-17'), TODAY)?.count).toBe(2);
  });

  it('5. an edition to prepare whose draw is impossible', () => {
    const state = home({
      groups: [
        group({}, edition({ status: 'preparing', drawPossible: false })),
      ],
    });
    expect(pickHomeAction(state, TODAY)).toMatchObject({
      kind: 'fixDraw',
      to: '/admin/famille-martin/editions/e1',
    });
  });

  it('6. an edition to prepare whose draw is possible, or not checked', () => {
    const state = (drawPossible: boolean | null) =>
      home({
        groups: [group({}, edition({ status: 'preparing', drawPossible }))],
      });
    expect(kindOf(state(true))).toBe('startDraw');
    expect(kindOf(state(null))).toBe('startDraw');
  });

  it('7. no gift hints yet, until the edition is closed', () => {
    const state = (over: Partial<HomeDrawState>) =>
      home({ draws: [draw({ hasHints: false, ...over })] });
    expect(pickHomeAction(state({}), TODAY)).toMatchObject({
      kind: 'addHints',
      to: '/p/token1/pistes',
      dismissKey: 'addHints:p1',
    });
    expect(kindOf(state({ status: 'preparing', revealed: false }))).toBe(
      'addHints',
    );
    expect(kindOf(state({ status: 'closed' }))).toBeNull();
    expect(kindOf(state({ hintsOn: false }))).toBeNull();
  });

  it('8. the party is over and the edition still open', () => {
    expect(
      pickHomeAction(
        home({ groups: [group({}, edition({ eventDate: '2026-12-09' }))] }),
        TODAY,
      ),
    ).toMatchObject({ kind: 'close', dismissKey: 'close:e1' });
  });

  it('9. a group without an edition, from October on', () => {
    const state = home({ groups: [group({}, null)] });
    expect(pickHomeAction(state, TODAY)).toMatchObject({
      kind: 'prepare',
      to: '/admin/famille-martin/editions/nouvelle',
      dismissKey: 'prepare:g1:2026',
    });
    expect(kindOf(state, '2026-10-01')).toBe('prepare');
    expect(kindOf(state, '2026-09-30')).toBeNull();
    expect(kindOf(state, '2027-01-05')).toBeNull();
  });

  it('10. an account allowed to create a group and without any', () => {
    expect(pickHomeAction(home({ canCreateGroup: true }), TODAY)).toMatchObject(
      { kind: 'createGroup', to: '/admin/groupes/nouveau' },
    );
    expect(
      kindOf(home({ canCreateGroup: true, groups: [group({}, edition())] })),
    ).toBeNull();
  });

  it('11. an account without a first name', () => {
    expect(pickHomeAction(home({ firstName: null }), TODAY)).toMatchObject({
      kind: 'completeProfile',
      to: '/compte',
      dismissKey: 'completeProfile',
    });
  });

  it('shows no card when nothing waits', () => {
    expect(pickHomeAction(home({ draws: [draw()] }), TODAY)).toBeNull();
  });
});

describe('pickHomeAction, order and ties', () => {
  it('puts what blocks others before what blocks me', () => {
    const state = home({
      draws: [draw({ revealed: false })],
      groups: [group({ id: 'g2' }, edition({ toNotify: 1 }))],
    });
    expect(kindOf(state)).toBe('notify');
    expect(kindOf({ ...state, groups: [] })).toBe('discover');
  });

  it('follows the order of the table, whatever the order of the data', () => {
    const state = home({
      firstName: null,
      canCreateGroup: true,
      draws: [draw({ hasHints: false })],
    });
    expect(kindOf(state)).toBe('addHints');
  });

  it('between two groups, the nearest party first', () => {
    const state = home({
      groups: [
        group(
          { id: 'g1', name: 'Amis', slug: 'amis' },
          edition({ id: 'e1', toNotify: 5, eventDate: '2026-12-31' }),
        ),
        group(
          { id: 'g2', name: 'Cousins', slug: 'cousins' },
          edition({ id: 'e2', toNotify: 1, eventDate: '2026-12-20' }),
        ),
      ],
    });
    expect(pickHomeAction(state, TODAY)?.groupName).toBe('Cousins');
  });

  it('then the most people concerned, then the name of the group', () => {
    const twoGroups = (a: number, b: number) =>
      home({
        groups: [
          group({ id: 'g1', name: 'Zèbres' }, edition({ toNotify: a })),
          group({ id: 'g2', name: 'Amis' }, edition({ toNotify: b })),
        ],
      });
    expect(pickHomeAction(twoGroups(4, 2), TODAY)?.groupName).toBe('Zèbres');
    expect(pickHomeAction(twoGroups(2, 2), TODAY)?.groupName).toBe('Amis');
  });

  it('puts a party without a date after one with a date', () => {
    const state = home({
      draws: [
        draw({
          id: 'p1',
          groupName: 'Sans date',
          eventDate: '',
          revealed: false,
        }),
        draw({ id: 'p2', groupName: 'Avec date', revealed: false }),
      ],
    });
    expect(pickHomeAction(state, TODAY)?.groupName).toBe('Avec date');
  });

  it('lets "Plus tard" put off an optional card, never a needed one', () => {
    const optional = home({
      draws: [draw({ hasHints: false })],
      firstName: null,
    });
    expect(kindOf(optional, TODAY, ['addHints:p1'])).toBe('completeProfile');
    expect(
      kindOf(optional, TODAY, ['addHints:p1', 'completeProfile']),
    ).toBeNull();
    const needed = home({ draws: [draw({ revealed: false })] });
    expect(kindOf(needed, TODAY, ['discover:p1'])).toBe('discover');
  });
});

describe('homeLayout', () => {
  it('lays out by group as soon as the account organises one', () => {
    expect(homeLayout({ draws: [], groups: [group()] })).toBe('groups');
  });

  it('otherwise by the draws going on', () => {
    expect(homeLayout({ draws: [], groups: [] })).toBe('empty');
    expect(
      homeLayout({ draws: [draw({ status: 'closed' })], groups: [] }),
    ).toBe('empty');
    expect(homeLayout({ draws: [draw()], groups: [] })).toBe('singleDraw');
    expect(
      homeLayout({ draws: [draw(), draw({ id: 'p2' })], groups: [] }),
    ).toBe('draws');
  });
});

describe('groupCards', () => {
  it('shows a group once, organised and joined', () => {
    const cards = groupCards({ draws: [draw()], groups: [group()] });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      groupId: 'g1',
      slug: 'famille-martin',
      draw: { id: 'p1' },
      edition: { id: 'e1' },
      eventDate: '2026-12-24',
    });
  });

  it('adds the groups where the account only takes part, by name', () => {
    const cards = groupCards({
      draws: [
        draw({ id: 'p2', groupId: 'g2', groupName: 'Amis' }),
        draw({
          id: 'p3',
          groupId: 'g3',
          groupName: 'Collègues',
          status: 'closed',
        }),
      ],
      groups: [group({}, null)],
    });
    expect(cards.map((c) => c.name)).toEqual(['Amis', 'Famille Martin']);
    expect(cards[0]).toMatchObject({ slug: null, edition: null });
    expect(cards[1]).toMatchObject({
      draw: null,
      edition: null,
      eventDate: '',
    });
  });
});

describe('pastDrawsByYear', () => {
  it('keeps the closed draws, by year, the latest first, then by group', () => {
    const past = (groupName: string, year: number, status = 'closed') => ({
      groupName,
      year,
      status,
    });
    expect(
      pastDrawsByYear([
        past('Cousins', 2024),
        past('Amis', 2025),
        past('Famille', 2026, 'drawn'),
        past('Amis', 2024),
      ]),
    ).toEqual([
      { year: 2025, draws: [past('Amis', 2025)] },
      { year: 2024, draws: [past('Amis', 2024), past('Cousins', 2024)] },
    ]);
    expect(pastDrawsByYear([])).toEqual([]);
  });
});
