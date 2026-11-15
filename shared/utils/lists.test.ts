import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { stackOf } from './lists';

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
