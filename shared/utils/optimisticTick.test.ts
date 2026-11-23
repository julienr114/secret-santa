import { describe, expect, it } from 'vitest';
import { tickedLine, untickedLine, withLine } from './optimisticTick';

const free = { id: 'a', view: { kind: 'free' as const }, mine: null };

describe('optimisticTick', () => {
  it('ticks a free line as mine, in the mode of the list', () => {
    expect(tickedLine(free, true)).toEqual({
      id: 'a',
      view: { kind: 'mine', mode: 'alone', anonymous: true },
      mine: { mode: 'alone', anonymous: true, note: null },
      pending: true,
    });
  });

  it('leaves a line taken meanwhile as it is', () => {
    const taken = { ...free, view: { kind: 'taken' as const, by: null } };
    expect(tickedLine(taken, false)).toBe(taken);
  });

  it('unticks what I give alone, and leaves a group without me', () => {
    expect(untickedLine(tickedLine(free, false))).toEqual({
      ...free,
      pending: true,
    });
    const group = {
      ...free,
      view: {
        kind: 'group' as const,
        closed: false,
        mine: true,
        leads: true,
        people: [{ me: true }, { me: false }],
      },
      mine: { mode: 'group' as const, anonymous: false, note: null },
    };
    expect(untickedLine(group).view).toEqual({
      kind: 'group',
      closed: false,
      mine: false,
      leads: false,
      people: [{ me: false }],
    });
    const alone = { ...group, view: { ...group.view, people: [{ me: true }] } };
    expect(untickedLine(alone).view).toEqual({ kind: 'free' });
  });

  it('changes only the line asked for', () => {
    const doc = { people: [{ ideas: [free, { ...free, id: 'b' }] }] };
    const next = withLine(doc, 'b', (line) => tickedLine(line, false));
    expect(next.people[0]!.ideas[0]).toBe(free);
    expect(next.people[0]!.ideas[1]!.view.kind).toBe('mine');
  });
});
