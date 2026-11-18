import { describe, expect, it } from 'vitest';
import {
  awardsOf,
  closeCallOf,
  detectiveScores,
  groupThreshold,
  pickAwards,
  smoothed,
  type Award,
  type AwardInput,
} from './awards';
import type { Guess } from './guesses';

// The draw: a → b → c → d → e → f → a.
const PEOPLE = ['a', 'b', 'c', 'd', 'e', 'f'];
const PAIRS = PEOPLE.map((giverId, i) => ({
  giverId,
  receiverId: PEOPLE[(i + 1) % PEOPLE.length]!,
}));
/** `guesser` thinks `giver` gives to `recipient`. */
const g = (
  guesserId: string,
  recipientId: string,
  giverId: string,
  more: Partial<Guess> = {},
): Guess => ({ guesserId, recipientId, giverId, ...more });
const input = (counted: Guess[], over: Partial<AwardInput> = {}) => ({
  counted,
  pairs: PAIRS,
  mode: 'all' as const,
  endedAt: null,
  ...over,
});
const kinds = (counted: Guess[], over: Partial<AwardInput> = {}) =>
  awardsOf(input(counted, over)).map((x) => x.kind);
const find = (counted: Guess[], kind: string) =>
  awardsOf(input(counted)).find((x) => x.kind === kind);

describe('the measures', () => {
  it('smooths a count', () => {
    expect(smoothed(0, 0)).toBe(0.5);
    expect(smoothed(3, 3)).toBe(0.8);
  });

  it('sets the threshold of the group: one in four, from 2 to 5', () => {
    expect([4, 8, 9, 13, 17, 100].map(groupThreshold)).toEqual([
      2, 2, 3, 4, 5, 5,
    ]);
  });
});

describe('Démasqués', () => {
  it('names those who found their Santa, out of those who tried', () => {
    expect(
      find([g('a', 'a', 'f'), g('b', 'b', 'c')], 'unmasked'),
    ).toMatchObject({ winners: ['a'], value: 1, total: 2 });
    expect(find([g('b', 'b', 'c')], 'unmasked')).toBeUndefined();
  });
});

describe('Le détective and Le sans-faute', () => {
  const guesses = [
    g('a', 'c', 'b'),
    g('d', 'c', 'a'),
    g('a', 'e', 'd'),
    g('b', 'e', 'd'),
    g('b', 'f', 'e'),
  ];
  it('values a right guess more when the others were wrong', () => {
    const scores = detectiveScores(guesses, PAIRS);
    expect(scores.find((s) => s.playerId === 'a')).toMatchObject({
      score: 3,
      right: 2,
      alone: 1,
    });
    // Alone on line f: 1.5.
    expect(scores.find((s) => s.playerId === 'b')?.score).toBe(2.5);
    expect(find(guesses, 'detective')).toMatchObject({
      winners: ['a'],
      value: 2,
      total: 2,
      extra: 1,
    });
  });

  it('needs two right guesses, and « Toutes les paires »', () => {
    expect(find([g('a', 'c', 'b')], 'detective')).toBeUndefined();
    expect(kinds(guesses, { mode: 'santa' })).not.toContain('detective');
  });

  it('gives the sans-faute in place of the detective, from three', () => {
    const flawless = [...guesses, g('a', 'f', 'e')];
    expect(kinds(flawless)).toContain('flawless');
    expect(kinds(flawless)).not.toContain('detective');
    expect(find(flawless, 'flawless')).toMatchObject({
      winners: ['a'],
      value: 3,
    });
  });
});

describe('the Santas, the rumour and the suspect', () => {
  // Five players: the threshold is 2.
  const guesses = [
    // Line b (Santa a): three tries, all wrong, two of them on f.
    g('c', 'b', 'f'),
    g('d', 'b', 'f'),
    g('e', 'b', 'c'),
    // Line d (Santa c): three tries, all right.
    g('b', 'd', 'c'),
    g('e', 'd', 'c'),
    g('f', 'd', 'c'),
  ];
  it('finds the best hidden and the most transparent', () => {
    expect(find(guesses, 'hidden')).toMatchObject({
      winners: ['a'],
      value: 0,
      total: 3,
    });
    expect(find(guesses, 'transparent')).toMatchObject({
      winners: ['c'],
      value: 3,
      total: 3,
    });
  });

  it('tells one rumour, and the ideal suspect', () => {
    expect(find(guesses, 'rumour')).toMatchObject({
      winners: ['f'],
      recipientId: 'b',
      value: 2,
    });
    expect(find(guesses, 'suspect')).toMatchObject({
      winners: ['f'],
      value: 2,
      extra: 1,
    });
  });

  it('skips them under the threshold', () => {
    expect(kinds(guesses.slice(0, 1))).toEqual([]);
  });

  it('leaves out naming oneself', () => {
    // a names himself on line b: no try on him.
    expect(find([g('a', 'b', 'a'), g('c', 'b', 'a')], 'transparent')).toBe(
      undefined,
    );
  });
});

describe('Les jumeaux and Les triplés', () => {
  const twins = [
    g('d', 'b', 'f'),
    g('e', 'b', 'f'),
    g('d', 'c', 'a'),
    g('e', 'c', 'a'),
    g('d', 'a', 'c'),
    g('e', 'a', 'c'),
  ];
  it('finds two players with three same guesses', () => {
    expect(find(twins, 'twins')).toMatchObject({
      winners: ['d', 'e'],
      value: 3,
      total: 3,
      extra: 3,
    });
    expect(find(twins.slice(2), 'twins')).toBeUndefined();
  });

  it('turns three of them into triplets, four back into twins', () => {
    const three = [
      ...twins,
      g('c', 'b', 'f'),
      g('c', 'c', 'a'),
      g('c', 'a', 'c'),
    ];
    expect(find(three, 'triplets')?.winners).toEqual(['c', 'd', 'e']);
    expect(kinds(three)).not.toContain('twins');
    const four = [
      ...three,
      g('b', 'b', 'f'),
      g('b', 'c', 'a'),
      g('b', 'a', 'c'),
    ];
    expect(kinds(four)).toContain('twins');
    expect(find(four, 'twins')?.winners).toHaveLength(2);
  });

  it('never names two pairs: the one settled first', () => {
    const at = (h: number) => `2026-12-24T${String(h).padStart(2, '0')}:00:00Z`;
    // Four players with the same three guesses: d and e settled at 9,
    // b and c at 10. Four are too many for triplets: one pair.
    const guesses = [
      ['b', 10],
      ['c', 10],
      ['d', 9],
      ['e', 9],
    ].flatMap(([p, h]) =>
      [
        ['b', 'f'],
        ['c', 'a'],
        ['a', 'c'],
      ].map(([r, x]) => g(p as string, r!, x!, { at: at(h as number) })),
    );
    const shown = awardsOf(input(guesses)).filter(
      (x) => x.kind === 'twins' || x.kind === 'triplets',
    );
    expect(shown).toHaveLength(1);
    expect(shown[0]).toMatchObject({ kind: 'twins', winners: ['d', 'e'] });
  });
});

describe('Sur le fil, La girouette, the group', () => {
  const end = '2026-12-24T18:00:00.000Z';
  it('finds the last guess in the last hour', () => {
    const guesses = [
      g('a', 'a', 'f', { at: '2026-12-24T17:56:00.000Z' }),
      g('b', 'b', 'a', { at: '2026-12-24T12:00:00.000Z' }),
    ];
    expect(
      awardsOf(input(guesses, { endedAt: end })).find(
        (x) => x.kind === 'lastMinute',
      ),
    ).toMatchObject({ winners: ['a'], value: 4 });
    expect(kinds(guesses.slice(1), { endedAt: end })).not.toContain(
      'lastMinute',
    );
  });

  it('finds who changed their mind three times', () => {
    expect(
      find(
        [
          g('a', 'c', 'd', { previous: ['e', 'f'] }),
          g('a', 'd', 'e', { previous: ['b'] }),
          g('b', 'c', 'd', { previous: ['e', 'f'] }),
        ],
        'weathervane',
      ),
    ).toMatchObject({ winners: ['a'], value: 3 });
    expect(
      find([g('a', 'c', 'd', { previous: ['e', 'f'] })], 'weathervane'),
    ).toBeUndefined();
  });

  it('compares the group with chance, from six guesses', () => {
    // 8 guesses, 6 participants: chance is 8 / 4 = 2.
    const guesses = [
      g('a', 'a', 'f'),
      g('b', 'b', 'a'),
      g('c', 'c', 'b'),
      g('d', 'd', 'c'),
      g('e', 'e', 'a'),
      g('f', 'f', 'a'),
      g('a', 'c', 'e'),
      g('b', 'd', 'a'),
    ];
    expect(find(guesses, 'group')).toMatchObject({
      value: 4,
      total: 8,
      extra: 2,
      tone: 'better',
    });
    expect(find(guesses.slice(0, 5), 'group')).toBeUndefined();
  });
});

describe('pickAwards', () => {
  const a = (kind: Award['kind'], strength: number): Award => ({
    kind,
    winners: [],
    count: 1,
    strength,
    value: 0,
  });
  it('keeps eight at most, the weakest out, never Démasqués nor the group', () => {
    const all = [
      a('group', 0),
      a('unmasked', 0),
      a('detective', 0.9),
      a('transparent', 0.8),
      a('hidden', 0.7),
      a('rumour', 0.6),
      a('suspect', 0.5),
      a('twins', 0.4),
      a('lastMinute', 0.3),
      a('weathervane', 0.2),
    ];
    const kept = pickAwards(all).map((x) => x.kind);
    expect(kept).toEqual([
      'unmasked',
      'detective',
      'transparent',
      'hidden',
      'rumour',
      'suspect',
      'twins',
      'group',
    ]);
  });
});

describe('Si près du but', () => {
  it('finds a right answer given up, for that player only', () => {
    const guesses = [
      g('c', 'b', 'f', { previous: ['a'] }),
      g('d', 'b', 'f', { previous: ['e'] }),
    ];
    expect(closeCallOf('c', input(guesses))).toBe('b');
    expect(closeCallOf('d', input(guesses))).toBeNull();
  });
});
