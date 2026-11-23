import { describe, expect, it } from 'vitest';
import { peopleToTake } from './take';

const people = [
  { id: 'a', partyId: 'p1', email: 'nadia@x.fr' },
  { id: 'b', partyId: 'p1', email: null },
  { id: 'c', partyId: 'p2', email: 'nadia@x.fr' },
  { id: 'd', partyId: 'p2', email: 'karim@x.fr' },
  { id: 'e', partyId: 'p3', email: 'sophie@x.fr' },
];

describe('« Reprendre ceux d’un autre événement »', () => {
  it('offers those of the events chosen only', () => {
    expect(peopleToTake(people, ['p1'], []).map((p) => p.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('shows an address once, and none already there', () => {
    expect(
      peopleToTake(people, ['p1', 'p2'], ['karim@x.fr']).map((p) => p.id),
    ).toEqual(['a', 'b']);
  });

  it('keeps everyone without an address', () => {
    expect(
      peopleToTake(
        [...people, { id: 'f', partyId: 'p1', email: null }],
        ['p1'],
        ['nadia@x.fr'],
      ).map((p) => p.id),
    ).toEqual(['b', 'f']);
  });
});
