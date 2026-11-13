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
    expect(
      personInputSchema.parse({
        firstName: ' Léa ',
        phone: '+33 6 12 34 56 78',
      }),
    ).toEqual({
      firstName: 'Léa',
      lastName: null,
      phone: '+33612345678',
    });
    expect(personInputSchema.safeParse({ firstName: '' }).success).toBe(false);
    expect(
      personInputSchema.safeParse({ firstName: 'Léa', phone: '06' }).success,
    ).toBe(false);
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
  it('never exposes the PIN hash or salt', () => {
    const exposed = publicPerson({
      id: 'p',
      firstName: 'Léa',
      lastName: null,
      phone: null,
      active: true,
      pinHash: 'h',
      pinSalt: 's',
      pinLockedAt: null,
      createdAt: 'd',
    });
    expect(exposed).toEqual({
      id: 'p',
      firstName: 'Léa',
      lastName: null,
      phone: null,
      active: true,
      hasPin: true,
      pinLocked: false,
      createdAt: 'd',
    });
    expect(JSON.stringify(exposed)).not.toMatch(/pinHash|pinSalt|"h"|"s"/);
  });
});
