import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { allowedReceivers, checkFeasibility, draw, shuffle } from './draw.js';

// Deterministic PRNG for tests (mulberry32). Production uses Web Crypto.
const seeded = (seed) => {
  const state = { a: seed };
  return (n) => {
    state.a = (state.a + 0x6d2b79f5) | 0;
    const t1 = Math.imul(state.a ^ (state.a >>> 15), 1 | state.a);
    const t2 = (t1 + Math.imul(t1 ^ (t1 >>> 7), 61 | t1)) ^ t1;
    return Math.floor((((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296) * n);
  };
};

const RULES = { excludeSpouse: true };
const base = (participants, extra = {}) => ({
  participants,
  couples: [],
  manualExclusions: [],
  history: {},
  ...extra,
});

const receiverOf = (assignments, giverId) =>
  assignments.find((a) => a.giverId === giverId).receiverId;

const expectPermutation = (assignments, participants) => {
  expect(assignments.map((a) => a.giverId).toSorted()).toEqual(
    participants.toSorted(),
  );
  expect(assignments.map((a) => a.receiverId).toSorted()).toEqual(
    participants.toSorted(),
  );
  assignments.forEach((a) => expect(a.giverId).not.toBe(a.receiverId));
};

describe('allowedReceivers', () => {
  it('excludes self, spouse, manual exclusions and history', () => {
    const allowed = allowedReceivers(
      base(['a', 'b', 'c', 'd'], {
        couples: [['a', 'b']],
        manualExclusions: [
          { giverId: 'c', receiverId: 'd', reciprocal: false },
        ],
        history: { d: ['a'] },
      }),
      RULES,
    );
    expect(allowed).toEqual({
      a: ['c', 'd'],
      b: ['c', 'd'],
      c: ['a', 'b'],
      d: ['b', 'c'],
    });
  });

  it('keeps spouses when excludeSpouse is off', () => {
    const allowed = allowedReceivers(
      base(['a', 'b', 'c'], { couples: [['a', 'b']] }),
      {
        excludeSpouse: false,
      },
    );
    expect(allowed.a).toEqual(['b', 'c']);
  });

  it('applies reciprocal manual exclusions both ways', () => {
    const allowed = allowedReceivers(
      base(['a', 'b', 'c'], {
        manualExclusions: [{ giverId: 'a', receiverId: 'b', reciprocal: true }],
      }),
      RULES,
    );
    expect(allowed.a).toEqual(['c']);
    expect(allowed.b).toEqual(['c']);
  });

  it('gives a newcomer (no history) no history exclusion', () => {
    const allowed = allowedReceivers(
      base(['a', 'b', 'c'], { history: { a: ['b'] } }),
      RULES,
    );
    expect(allowed.c).toEqual(['a', 'b']);
  });

  it('ignores couples and history entries about people who are not participating', () => {
    const allowed = allowedReceivers(
      base(['a', 'b', 'c'], {
        couples: [['a', 'zed']],
        history: { a: ['zed'], zed: ['a'] },
      }),
      RULES,
    );
    expect(allowed).toEqual({ a: ['b', 'c'], b: ['a', 'c'], c: ['a', 'b'] });
  });
});

describe('shuffle', () => {
  it('returns a permutation and leaves the input untouched', () => {
    const input = Object.freeze([1, 2, 3, 4, 5]);
    const out = shuffle(input, seeded(1));
    expect(out.toSorted()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(shuffle([], seeded(1))).toEqual([]);
  });
});

describe('checkFeasibility', () => {
  it('rejects fewer than two participants', () => {
    expect(checkFeasibility(base(['a']), RULES).reason).toBe(
      'too_few_participants',
    );
  });

  it('two participants in a couple: impossible, both blocked', () => {
    const result = checkFeasibility(
      base(['a', 'b'], { couples: [['a', 'b']] }),
      RULES,
    );
    expect(result.ok).toBe(false);
    expect(result.details.blocked.toSorted()).toEqual(['a', 'b']);
  });

  it('three participants with one couple: impossible, names the constrained ones', () => {
    const result = checkFeasibility(
      base(['a', 'b', 'c'], { couples: [['a', 'b']] }),
      RULES,
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_solution');
    expect(result.details.blocked).toEqual([]);
    expect(result.details.constrained.toSorted()).toEqual(['a', 'b', 'c']);
    expect(result.details.allowedCounts).toEqual({ a: 1, b: 1, c: 2 });
  });

  it('two couples with two years of history blocking everything: impossible', () => {
    const result = checkFeasibility(
      base(['a', 'b', 'c', 'd'], {
        couples: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        history: { a: ['c', 'd'], b: ['c', 'd'], c: ['a', 'b'], d: ['a', 'b'] },
      }),
      RULES,
    );
    expect(result.details.blocked.toSorted()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('two couples with one year of history: possible', () => {
    const result = checkFeasibility(
      base(['a', 'b', 'c', 'd'], {
        couples: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        history: { a: ['c'], b: ['d'], c: ['a'], d: ['b'] },
      }),
      RULES,
    );
    expect(result.ok).toBe(true);
  });
});

describe('draw', () => {
  it('produces a derangement respecting every constraint', () => {
    const input = base(['a', 'b', 'c', 'd', 'e', 'f'], {
      couples: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      manualExclusions: [{ giverId: 'e', receiverId: 'f', reciprocal: true }],
      history: { a: ['c'], b: ['d'] },
    });
    const result = draw(input, RULES, { random: seeded(42) });
    expect(result.ok).toBe(true);
    const { assignments } = result.value;
    expectPermutation(assignments, input.participants);
    expect(['b']).not.toContain(receiverOf(assignments, 'a'));
    expect(['a']).not.toContain(receiverOf(assignments, 'b'));
    expect(receiverOf(assignments, 'e')).not.toBe('f');
    expect(receiverOf(assignments, 'f')).not.toBe('e');
    expect(receiverOf(assignments, 'a')).not.toBe('c');
    expect(receiverOf(assignments, 'b')).not.toBe('d');
  });

  it('returns the feasibility failure when no solution exists', () => {
    const result = draw(base(['a', 'b'], { couples: [['a', 'b']] }), RULES, {
      random: seeded(1),
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_solution');
  });

  it('falls back to backtracking when rejection sampling is hopeless', () => {
    // A long chain where each giver has exactly one allowed receiver.
    const n = 12;
    const ids = Array.from({ length: n }, (_, i) => `p${i}`);
    const manualExclusions = ids.flatMap((g, i) =>
      ids
        .filter((r) => r !== g && r !== ids[(i + 1) % n])
        .map((receiverId) => ({ giverId: g, receiverId, reciprocal: false })),
    );
    const result = draw(base(ids, { manualExclusions }), RULES, {
      random: seeded(7),
    });
    expect(result.ok).toBe(true);
    ids.forEach((g, i) =>
      expect(receiverOf(result.value.assignments, g)).toBe(ids[(i + 1) % n]),
    );
  });

  it('is uniform over the 9 derangements of 4 people (10 000 draws)', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const random = seeded(2026);
    const counts = Array.from({ length: 10_000 }, () =>
      draw(base(ids), RULES, { random })
        .value.assignments.map((x) => x.receiverId)
        .join(''),
    ).reduce((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {});
    expect(Object.keys(counts)).toHaveLength(9);
    Object.values(counts).forEach((count) => {
      expect(count).toBeGreaterThan(10_000 / 9 / 1.2);
      expect(count).toBeLessThan((10_000 / 9) * 1.2);
    });
  });

  it('property: any returned solution satisfies all constraints; failures are real', () => {
    const permutations = (items) =>
      items.length <= 1
        ? [items]
        : items.flatMap((x, i) =>
            permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(
              (p) => [x, ...p],
            ),
          );
    const arb = fc
      .integer({ min: 3, max: 9 })
      .chain((n) => {
        const ids = Array.from({ length: n }, (_, i) => `p${i}`);
        const pair = fc.tuple(fc.constantFrom(...ids), fc.constantFrom(...ids));
        return fc.record({
          ids: fc.constant(ids),
          couples: fc.array(pair, { maxLength: 3 }),
          manualExclusions: fc.array(
            fc.record({
              giverId: fc.constantFrom(...ids),
              receiverId: fc.constantFrom(...ids),
              reciprocal: fc.boolean(),
            }),
            { maxLength: 4 },
          ),
          historyPairs: fc.array(pair, { maxLength: 6 }),
          seed: fc.integer(),
        });
      })
      .filter(({ couples }) => {
        const seen = couples.flat();
        return new Set(seen).size === seen.length;
      });

    fc.assert(
      fc.property(
        arb,
        ({ ids, couples, manualExclusions, historyPairs, seed }) => {
          const history = historyPairs.reduce(
            (acc, [g, r]) => ({ ...acc, [g]: [...(acc[g] ?? []), r] }),
            {},
          );
          const input = base(ids, { couples, manualExclusions, history });
          const allowed = allowedReceivers(input, RULES);
          const result = draw(input, RULES, { random: seeded(seed) });
          if (result.ok) {
            expectPermutation(result.value.assignments, ids);
            result.value.assignments.forEach(({ giverId, receiverId }) =>
              expect(allowed[giverId]).toContain(receiverId),
            );
          } else if (ids.length <= 6) {
            const exists = permutations(ids).some((perm) =>
              perm.every((receiverId, i) =>
                allowed[ids[i]].includes(receiverId),
              ),
            );
            expect(exists).toBe(false);
          }
        },
      ),
      { numRuns: 300 },
    );
  });
});
