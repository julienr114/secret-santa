import { describe, it, expect } from 'vitest';
import { displayName, personInputSchema, publicPerson } from './people';
import { avatarOf } from './avatars';

describe('people schemas', () => {
  it('normalizes a person input', () => {
    expect(personInputSchema.parse({ firstName: ' Léa ' })).toEqual({
      firstName: 'Léa',
      lastName: null,
    });
    expect(personInputSchema.safeParse({ firstName: '' }).success).toBe(false);
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
      avatar: avatarOf({ id: 'p' }),
      createdAt: 'd',
    });
  });
});
