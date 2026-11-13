import { describe, it, expect } from 'vitest';
import {
  activeCoupleOf,
  coupleInputSchema,
  displayName,
  personInputSchema,
  publicPerson,
} from './people';

describe('people schemas', () => {
  it('normalizes a person input', () => {
    expect(personInputSchema.parse({ firstName: ' Léa ' })).toEqual({
      firstName: 'Léa',
      lastName: null,
    });
    expect(personInputSchema.safeParse({ firstName: '' }).success).toBe(false);
  });

  it('refuses a couple of one person', () => {
    expect(
      coupleInputSchema.safeParse({ personAId: 'a', personBId: 'a' }).success,
    ).toBe(false);
  });
});

describe('activeCoupleOf', () => {
  const couples = [
    { id: 'c1', personAId: 'a', personBId: 'b', active: false },
    { id: 'c2', personAId: 'b', personBId: 'c', active: true },
  ];
  it('finds only active couples, from either side', () => {
    expect(activeCoupleOf(couples, 'c')?.id).toBe('c2');
    expect(activeCoupleOf(couples, 'b')?.id).toBe('c2');
    expect(activeCoupleOf(couples, 'a')).toBeNull();
  });
});

describe('displayName', () => {
  const people = [
    { id: '1', firstName: 'Léa', lastName: 'Martin' },
    { id: '2', firstName: 'Léa', lastName: 'Durand' },
    { id: '3', firstName: 'Tom', lastName: 'Martin' },
  ];
  it('adds the last name only for homonyms', () => {
    expect(displayName(people[0]!, people)).toBe('Léa Martin');
    expect(displayName(people[2]!, people)).toBe('Tom');
    expect(
      displayName({ id: '4', firstName: 'Zoé', lastName: null }, people),
    ).toBe('Zoé');
  });
});

describe('publicPerson', () => {
  it('exposes only display fields', () => {
    expect(
      publicPerson({
        id: 'p',
        firstName: 'Léa',
        lastName: null,
        active: true,
        createdAt: 'd',
      }),
    ).toEqual({
      id: 'p',
      firstName: 'Léa',
      lastName: null,
      active: true,
      createdAt: 'd',
    });
  });
});
