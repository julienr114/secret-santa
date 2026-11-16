import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { FOLD_FROM, foldList, stackOf } from './lists';

describe('stackOf', () => {
  it('shows four items by default and counts the rest', () => {
    expect(stackOf([1, 2, 3, 4, 5, 6])).toEqual({
      shown: [1, 2, 3, 4],
      more: 2,
    });
    expect(stackOf([1, 2])).toEqual({ shown: [1, 2], more: 0 });
    expect(stackOf([])).toEqual({ shown: [], more: 0 });
  });

  it('takes another maximum, never below zero', () => {
    expect(stackOf([1, 2, 3], 1)).toEqual({ shown: [1], more: 2 });
    expect(stackOf([1, 2, 3], -2)).toEqual({ shown: [], more: 3 });
  });

  it('never loses nor invents an item', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.nat(10), (items, max) => {
        const { shown, more } = stackOf(items, max);
        expect(shown.length + more).toBe(items.length);
        expect(shown).toEqual(items.slice(0, shown.length));
        expect(shown.length).toBeLessThanOrEqual(max);
      }),
    );
  });
});

describe('foldList', () => {
  const people = (n: number) => Array.from({ length: n }, (_, i) => i);

  it('shows every row up to the fold size', () => {
    expect(foldList(people(FOLD_FROM), 6)).toEqual({
      shown: people(FOLD_FROM),
      rest: [],
    });
    expect(foldList([], 6)).toEqual({ shown: [], rest: [] });
  });

  it('past it, shows the first rows and keeps the others behind', () => {
    const { shown, rest } = foldList(people(100), 6);
    expect(shown).toEqual([0, 1, 2, 3, 4, 5]);
    expect(rest).toHaveLength(94);
    expect(rest[0]).toBe(6);
  });

  it('takes another fold size, never shows less than nothing', () => {
    expect(foldList(people(5), 3, 4)).toEqual({
      shown: [0, 1, 2],
      rest: [3, 4],
    });
    expect(foldList(people(5), -1, 4)).toEqual({
      shown: [],
      rest: people(5),
    });
  });

  it('never loses, invents nor reorders a row', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        fc.nat(20),
        fc.nat(20),
        (items, shown, from) => {
          const fold = foldList(items, shown, from);
          expect([...fold.shown, ...fold.rest]).toEqual(items);
        },
      ),
    );
  });
});
