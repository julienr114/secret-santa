import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { carriedOver, participantChanges, toggleChosen } from './participants';

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

describe('carriedOver', () => {
  const members = [
    { id: 'a', active: true },
    { id: 'b', active: false },
    { id: 'c', active: true },
  ];

  it('takes every active member for a first edition', () => {
    expect(carriedOver(members, null).map((m) => m.id)).toEqual(['a', 'c']);
  });

  it('takes those of the previous edition still active', () => {
    expect(carriedOver(members, ['b', 'c']).map((m) => m.id)).toEqual(['c']);
  });

  it('takes nobody when nobody took part', () => {
    expect(carriedOver(members, [])).toEqual([]);
  });
});
