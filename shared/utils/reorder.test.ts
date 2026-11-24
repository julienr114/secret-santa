import { describe, expect, it } from 'vitest';
import {
  applyOrder,
  ideasChangingPerson,
  mergeLines,
  moveIdea,
  movePerson,
  orderWrites,
  placeOfIdea,
  sameOrder,
  stepIdea,
  stepPerson,
  withLines,
  type ListOrder,
} from './reorder';

const order: ListOrder = [
  { id: 'leo', ideas: ['a', 'b', 'c'] },
  { id: 'zoe', ideas: ['d'] },
  { id: 'hugo', ideas: [] },
];

describe('the order of a list', () => {
  it('moves an idea among those of its person', () => {
    expect(
      moveIdea(order, 'a', { personId: 'leo', index: 2 })[0]?.ideas,
    ).toEqual(['b', 'c', 'a']);
    expect(
      moveIdea(order, 'c', { personId: 'leo', index: 0 })[0]?.ideas,
    ).toEqual(['c', 'a', 'b']);
    // Dropped where it was: nothing moves.
    expect(
      sameOrder(moveIdea(order, 'b', { personId: 'leo', index: 1 }), order),
    ).toBe(true);
    // Past the end is the end.
    expect(
      moveIdea(order, 'a', { personId: 'leo', index: 99 })[0]?.ideas,
    ).toEqual(['b', 'c', 'a']);
  });

  it('moves an idea to another person, an empty one included', () => {
    expect(moveIdea(order, 'b', { personId: 'zoe', index: 0 })).toEqual([
      { id: 'leo', ideas: ['a', 'c'] },
      { id: 'zoe', ideas: ['b', 'd'] },
      { id: 'hugo', ideas: [] },
    ]);
    expect(moveIdea(order, 'd', { personId: 'hugo', index: 0 })).toEqual([
      { id: 'leo', ideas: ['a', 'b', 'c'] },
      { id: 'zoe', ideas: [] },
      { id: 'hugo', ideas: ['d'] },
    ]);
    // Unknown idea or person: the order as it was.
    expect(moveIdea(order, 'x', { personId: 'zoe', index: 0 })).toBe(order);
    expect(moveIdea(order, 'a', { personId: 'nobody', index: 0 })).toBe(order);
  });

  it('moves a person with their ideas', () => {
    expect(movePerson(order, 'leo', 2).map((s) => s.id)).toEqual([
      'zoe',
      'hugo',
      'leo',
    ]);
    expect(movePerson(order, 'hugo', 0)[0]).toEqual({ id: 'hugo', ideas: [] });
    expect(movePerson(order, 'leo', 2)[2]?.ideas).toEqual(['a', 'b', 'c']);
    expect(movePerson(order, 'nobody', 0)).toBe(order);
  });

  it('steps an idea up and down, across people, and stops at the ends', () => {
    expect(stepIdea(order, 'b', -1)[0]?.ideas).toEqual(['b', 'a', 'c']);
    expect(stepIdea(order, 'b', 1)[0]?.ideas).toEqual(['a', 'c', 'b']);
    // From the last of Léo's to the first of Zoé's, and back to the end.
    expect(stepIdea(order, 'c', 1)[1]?.ideas).toEqual(['c', 'd']);
    expect(stepIdea(order, 'd', -1)[0]?.ideas).toEqual(['a', 'b', 'c', 'd']);
    expect(stepIdea(order, 'a', -1)).toBe(order);
    expect(stepIdea(order, 'd', 1)[2]?.ideas).toEqual(['d']);
    const last = stepIdea(order, 'd', 1);
    expect(stepIdea(last, 'd', 1)).toBe(last);
  });

  it('keeps an idea someone gives with its person', () => {
    expect(stepIdea(order, 'b', 1, true)[0]?.ideas).toEqual(['a', 'c', 'b']);
    expect(stepIdea(order, 'c', 1, true)).toBe(order);
    expect(stepIdea(order, 'd', -1, true)).toBe(order);
  });

  it('tells which ideas change person', () => {
    const among = orderWrites(order, [
      { id: 'leo', ideas: ['b', 'a', 'c'] },
      { id: 'zoe', ideas: ['d'] },
      { id: 'hugo', ideas: [] },
    ]);
    expect(among && ideasChangingPerson(order, among)).toEqual([]);
    const away = orderWrites(order, [
      { id: 'leo', ideas: ['b', 'c'] },
      { id: 'zoe', ideas: ['d', 'a'] },
      { id: 'hugo', ideas: [] },
    ]);
    expect(away && ideasChangingPerson(order, away)).toEqual(['a']);
  });

  it('steps a person up and down', () => {
    expect(stepPerson(order, 'zoe', -1).map((s) => s.id)).toEqual([
      'zoe',
      'leo',
      'hugo',
    ]);
    expect(stepPerson(order, 'zoe', 1).map((s) => s.id)).toEqual([
      'leo',
      'hugo',
      'zoe',
    ]);
    expect(stepPerson(order, 'leo', -1)).toBe(order);
    expect(stepPerson(order, 'hugo', 1)).toBe(order);
  });

  it('says where an idea is', () => {
    expect(placeOfIdea(order, 'c')).toEqual({
      personId: 'leo',
      index: 2,
      count: 3,
    });
    expect(placeOfIdea(order, 'x')).toBeNull();
  });

  it('puts the people and ideas of a list in an order', () => {
    const sections = [
      { id: 'leo', name: 'Léo', ideas: [{ id: 'a' }, { id: 'b' }] },
      { id: 'zoe', name: 'Zoé', ideas: [{ id: 'd' }, { id: 'new' }] },
    ];
    const moved = applyOrder(
      sections,
      [
        { id: 'zoe', ideas: ['b', 'd'] },
        { id: 'leo', ideas: ['a'] },
      ],
      (idea) => idea.id,
    );
    expect(moved.map((s) => s.name)).toEqual(['Zoé', 'Léo']);
    // An idea the order does not name keeps its place, at the end.
    expect(moved[0]?.ideas.map((i) => i.id)).toEqual(['b', 'd', 'new']);
    expect(moved[1]?.ideas.map((i) => i.id)).toEqual(['a']);
    // A person the order does not name stays, last.
    expect(
      applyOrder(sections, [{ id: 'zoe', ideas: ['d'] }], (i) => i.id).map(
        (s) => s.id,
      ),
    ).toEqual(['zoe', 'leo']);
  });

  it('writes only what moved, and refuses another list', () => {
    expect(orderWrites(order, order)).toEqual({ people: [], ideas: [] });
    // One idea to another person: it, and those whose place changed.
    expect(
      orderWrites(order, moveIdea(order, 'a', { personId: 'zoe', index: 1 })),
    ).toEqual({
      people: [],
      ideas: [
        { id: 'b', listPersonId: 'leo', position: 0 },
        { id: 'c', listPersonId: 'leo', position: 1 },
        { id: 'd', listPersonId: 'zoe', position: 0 },
        { id: 'a', listPersonId: 'zoe', position: 1 },
      ],
    });
    expect(orderWrites(order, movePerson(order, 'hugo', 0))).toEqual({
      people: [
        { id: 'hugo', position: 0 },
        { id: 'leo', position: 1 },
        { id: 'zoe', position: 2 },
      ],
      ideas: [],
    });
    // An idea missing, added, or named twice: not the same list any more.
    expect(
      orderWrites(order, [{ id: 'leo', ideas: ['a', 'b', 'c'] }]),
    ).toBeNull();
    expect(
      orderWrites(order, [
        { id: 'leo', ideas: ['a', 'b'] },
        { id: 'zoe', ideas: ['d'] },
        { id: 'hugo', ideas: [] },
      ]),
    ).toBeNull();
    expect(
      orderWrites(order, [
        { id: 'leo', ideas: ['a', 'b', 'c', 'a'] },
        { id: 'zoe', ideas: ['d'] },
        { id: 'hugo', ideas: [] },
      ]),
    ).toBeNull();
  });

  it('puts the gifts not on the list among the ideas', () => {
    const at = (id: string, position: number | null, createdAt = '1') => ({
      id,
      position,
      createdAt,
    });
    expect(
      mergeLines(
        [at('a', 0), at('b', 2), at('c', 3)],
        [at('x', 1), at('y', null, '2'), at('z', null, '1')],
      ),
    ).toEqual(['a', 'x', 'b', 'c', 'z', 'y']);
    // At the same place, the idea first.
    expect(mergeLines([at('a', 1)], [at('x', 1)])).toEqual(['a', 'x']);
  });

  it('lays the lines of each person as an order wants them', () => {
    const leo = {
      id: 'leo',
      ideas: [{ id: 'a' }, { id: 'b' }],
      offList: [{ id: 'x' }],
      lines: ['a', 'b', 'x'],
    };
    const zoe = { id: 'zoe', ideas: [{ id: 'c' }], offList: [], lines: [] };
    expect(withLines([leo], null)[0]?.lines).toEqual(['a', 'b', 'x']);
    expect(
      withLines([leo], [{ id: 'leo', ideas: ['x', 'a', 'b'] }])[0]?.lines,
    ).toEqual(['x', 'a', 'b']);
    // An idea come from someone else; one the order does not name yet.
    expect(withLines([leo, zoe], [{ id: 'zoe', ideas: [] }])[1]?.lines).toEqual(
      ['c'],
    );
    expect(
      withLines([leo], [{ id: 'leo', ideas: ['b', 'a'] }])[0]?.lines,
    ).toEqual(['b', 'a', 'x']);
  });
});
