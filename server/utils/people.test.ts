import { describe, it, expect } from 'vitest';
import {
  byName,
  canChangePerson,
  displayName,
  firstNameFromEmail,
  fullName,
  personFromProfile,
  personInputSchema,
  profileSchema,
  publicPerson,
} from './people';
import { avatarOf } from './avatars';

describe('people schemas', () => {
  it('normalizes a person input', () => {
    expect(personInputSchema.parse({ firstName: ' Léa ' })).toEqual({
      firstName: 'Léa',
      lastName: null,
      email: null,
      language: 'fr',
    });
    expect(personInputSchema.safeParse({ firstName: '' }).success).toBe(false);
  });

  it('accepts an optional email, trimmed and lowercased', () => {
    expect(
      personInputSchema.parse({ firstName: 'Léa', email: ' Lea@Example.COM ' })
        .email,
    ).toBe('lea@example.com');
    expect(
      personInputSchema.safeParse({
        firstName: 'Léa',
        email: 'pas-une-adresse',
      }).success,
    ).toBe(false);
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
      email: null,
      language: 'fr',
      active: true,
      avatar: avatarOf({ id: 'p' }),
      createdAt: 'd',
    });
  });
});

describe('profile of an account', () => {
  const account = {
    email: 'lea@example.com',
    firstName: 'Léa',
    lastName: null,
    language: 'de',
    avatarEmoji: null,
    avatarColor: null,
  };

  it('asks for a first name, an avatar and a language', () => {
    const profile = {
      firstName: ' Léa ',
      lastName: null,
      language: 'fr',
      avatarEmoji: '🎄',
      avatarColor: 'pine',
    };
    expect(profileSchema.parse(profile).firstName).toBe('Léa');
    expect(
      profileSchema.safeParse({ ...profile, firstName: ' ' }).success,
    ).toBe(false);
  });

  it('becomes a person with the address and the language of the account', () => {
    expect(personFromProfile(account)).toEqual({
      firstName: 'Léa',
      lastName: null,
      email: 'lea@example.com',
      language: 'de',
      avatarEmoji: undefined,
      avatarColor: undefined,
    });
  });

  it('keeps a chosen avatar and drops one that no longer exists', () => {
    const person = personFromProfile({
      ...account,
      avatarEmoji: '🎄',
      avatarColor: 'not-a-colour',
    });
    expect(person?.avatarEmoji).toBe('🎄');
    expect(person?.avatarColor).toBeUndefined();
  });

  it('guesses a first name from the address without a profile', () => {
    expect(personFromProfile({ ...account, firstName: null }).firstName).toBe(
      'Lea',
    );
  });
});

describe('firstNameFromEmail', () => {
  it('takes the first word of the address, capitalised', () => {
    expect(firstNameFromEmail('marie.dupont@example.com')).toBe('Marie');
    expect(firstNameFromEmail('orga-e2e@example.com')).toBe('Orga');
    expect(firstNameFromEmail('paul+noel@example.com')).toBe('Paul');
  });

  it('keeps the address when there is no word to take', () => {
    expect(firstNameFromEmail('2024@example.com')).toBe('2024@example.com');
  });
});

describe('canChangePerson', () => {
  const organizers = ['orga@example.com'];

  it('leaves anyone else alone', () => {
    expect(canChangePerson('lea@example.com', organizers, 'delete').ok).toBe(
      true,
    );
    expect(canChangePerson(null, organizers, { active: false }).ok).toBe(true);
  });

  it('keeps an organiser in the group, with their address', () => {
    const orga = 'orga@example.com';
    expect(canChangePerson(orga, organizers, 'delete').ok).toBe(false);
    expect(canChangePerson(orga, organizers, { active: false }).ok).toBe(false);
    expect(canChangePerson(orga, organizers, { email: null }).ok).toBe(false);
    expect(
      canChangePerson(orga, organizers, { email: 'autre@example.com' }).ok,
    ).toBe(false);
  });

  it('lets an organiser be edited otherwise', () => {
    const orga = 'orga@example.com';
    expect(canChangePerson(orga, organizers, { active: true }).ok).toBe(true);
    expect(canChangePerson(orga, organizers, { email: orga }).ok).toBe(true);
    expect(canChangePerson(orga, organizers, {}).ok).toBe(true);
  });
});

describe('fullName', () => {
  it('joins the names that are known', () => {
    expect(fullName({ firstName: 'Léa', lastName: 'Martin' })).toBe(
      'Léa Martin',
    );
    expect(fullName({ firstName: 'Léa', lastName: null })).toBe('Léa');
    expect(fullName({ firstName: null, lastName: null })).toBe('');
  });
});

describe('byName', () => {
  it('orders by first name, then last name, a missing one first', () => {
    const people = [
      { firstName: 'Adèle', lastName: 'Martin' },
      { firstName: 'Zoé', lastName: null },
      { firstName: 'Adèle', lastName: 'Bernard' },
      { firstName: 'Adèle' },
    ];
    expect(people.toSorted(byName)).toEqual([
      { firstName: 'Adèle' },
      { firstName: 'Adèle', lastName: 'Bernard' },
      { firstName: 'Adèle', lastName: 'Martin' },
      { firstName: 'Zoé', lastName: null },
    ]);
  });
});
