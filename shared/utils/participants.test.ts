import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { participantChanges, toggleChosen } from './participants';

describe('participantChanges', () => {
  it('adds the newly ticked and removes the unticked', () => {
    expect(participantChanges(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual({
      add: ['d'],
      remove: ['a'],
    });
  });

  it('changes nothing when the list is the same', () => {
    expect(participantChanges(['a', 'b'], ['b', 'a'])).toEqual({
      add: [],
      remove: [],
    });
  });

  it('starts an empty edition', () => {
    expect(participantChanges([], ['a', 'b'])).toEqual({
      add: ['a', 'b'],
      remove: [],
    });
  });

  it('empties an edition', () => {
    expect(participantChanges(['a'], [])).toEqual({ add: [], remove: ['a'] });
  });

  it('leads from the current list to the chosen one', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string()),
        fc.uniqueArray(fc.string()),
        (current, chosen) => {
          const { add, remove } = participantChanges(current, chosen);
          const after = [
            ...current.filter((id) => !remove.includes(id)),
            ...add,
          ];
          expect(new Set(after)).toEqual(new Set(chosen));
        },
      ),
    );
  });
});

describe('toggleChosen', () => {
  it('ticks someone once', () => {
    expect(toggleChosen(['a'], 'b', true)).toEqual(['a', 'b']);
    expect(toggleChosen(['a'], 'a', true)).toEqual(['a']);
  });

  it('unticks someone', () => {
    expect(toggleChosen(['a', 'b'], 'a', false)).toEqual(['b']);
    expect(toggleChosen(['a'], 'z', false)).toEqual(['a']);
  });
});
