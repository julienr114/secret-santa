import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { FOLD_FROM, FOLD_STEP, foldList, listView, stackOf } from './lists';

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
      unfolded: [],
      rest: [],
    });
    expect(foldList([], 6)).toEqual({ shown: [], unfolded: [], rest: [] });
  });

  it('past it, shows the first rows and keeps the others behind', () => {
    const { shown, unfolded, rest } = foldList(people(100), 6);
    expect(shown).toEqual([0, 1, 2, 3, 4, 5]);
    expect(unfolded).toEqual([]);
    expect(rest).toHaveLength(94);
    expect(rest[0]).toBe(6);
  });

  it('unfolds by batches after the first rows', () => {
    const once = foldList(people(300), 6, FOLD_STEP);
    expect(once.unfolded).toHaveLength(FOLD_STEP);
    expect(once.unfolded[0]).toBe(6);
    expect(once.rest).toHaveLength(300 - 6 - FOLD_STEP);
    const all = foldList(people(100), 6, 2 * FOLD_STEP);
    expect(all.unfolded).toHaveLength(94);
    expect(all.rest).toEqual([]);
  });

  it('takes another fold size, never shows less than nothing', () => {
    expect(foldList(people(5), 3, 0, 4)).toEqual({
      shown: [0, 1, 2],
      unfolded: [],
      rest: [3, 4],
    });
    expect(foldList(people(5), -1, -3, 4)).toEqual({
      shown: [],
      unfolded: [],
      rest: people(5),
    });
  });

  it('never loses, invents nor reorders a row', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        fc.nat(20),
        fc.nat(120),
        fc.nat(20),
        (items, shown, opened, from) => {
          const fold = foldList(items, shown, opened, from);
          expect([...fold.shown, ...fold.unfolded, ...fold.rest]).toEqual(
            items,
          );
        },
      ),
    );
  });
});

describe('listView', () => {
  const names = Array.from({ length: 20 }, (_, i) => `Personne ${i}`);
  const look = { query: '', opened: 0, shown: 6, nameOf: (n: string) => n };

  it('folds a long list', () => {
    const view = listView(names, look);
    expect(view.shown).toHaveLength(6);
    expect(view.rest).toHaveLength(14);
  });

  it('unfolds as far as asked', () => {
    const view = listView(names, { ...look, opened: FOLD_STEP });
    expect(view.unfolded).toHaveLength(14);
    expect(view.rest).toEqual([]);
  });

  it('shows every match while searching, never folded', () => {
    const view = listView(['Élodie', 'Lola', 'Hugo', 'Lou'], {
      ...look,
      shown: 1,
      from: 0,
      query: 'lo',
    });
    expect(view).toEqual({
      shown: ['Élodie', 'Lola', 'Lou'],
      unfolded: [],
      rest: [],
    });
    expect(listView(names, { ...look, query: '   ' }).shown).toHaveLength(6);
  });
});
