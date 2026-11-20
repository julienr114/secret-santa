import { describe, expect, it } from 'vitest';
import {
  MAX_PARTY_MEMBERS,
  canLeaveParty,
  checkPartySize,
  leavingLists,
  partyInputSchema,
  takenPeople,
  usualDateOf,
} from './parties';

describe('partyInputSchema', () => {
  it('takes a category, a name, an ISO day and the people taken', () => {
    expect(
      partyInputSchema.parse({
        category: 'birthday',
        name: '  L’anniversaire de Zoé ',
        date: '2026-12-14',
        recurring: true,
      }),
    ).toEqual({
      category: 'birthday',
      name: 'L’anniversaire de Zoé',
      date: '2026-12-14',
      recurring: true,
      memberIds: [],
    });
  });

  it('refuses a date that is not a day, an unknown category, a web address', () => {
    const base = { category: 'christmas', name: 'Noël', recurring: true };
    expect(
      partyInputSchema.safeParse({ ...base, date: '25 décembre' }).success,
    ).toBe(false);
    expect(
      partyInputSchema.safeParse({
        ...base,
        category: 'easter',
        date: '2026-12-25',
      }).success,
    ).toBe(false);
    expect(
      partyInputSchema.safeParse({
        ...base,
        name: 'www.example.com',
        date: '2026-12-25',
      }).success,
    ).toBe(false);
  });
});

describe('usualDateOf', () => {
  it('keeps the month and the day', () => {
    expect(usualDateOf('2026-12-25')).toBe('12-25');
  });
});

describe('takenPeople', () => {
  it('keeps one person per address, all those without one, never me', () => {
    const people = [
      { id: 'a', firstName: 'Camille', email: 'camille@x.fr' },
      { id: 'b', firstName: 'Moi', email: 'moi@x.fr' },
      { id: 'c', firstName: 'Tom', email: null },
      { id: 'd', firstName: 'Camille', email: 'camille@x.fr' },
      { id: 'e', firstName: 'Tom', email: null },
    ];
    expect(takenPeople(people, 'moi@x.fr').map((p) => p.id)).toEqual([
      'a',
      'c',
      'e',
    ]);
  });
});

describe('checkPartySize', () => {
  it('allows thirty members, not more', () => {
    expect(checkPartySize(MAX_PARTY_MEMBERS).ok).toBe(true);
    expect(checkPartySize(MAX_PARTY_MEMBERS + 1)).toMatchObject({
      ok: false,
      reason: 'too_many_members',
    });
  });
});

describe('canLeaveParty', () => {
  it('lets a member leave, not an organiser', () => {
    expect(canLeaveParty('member').ok).toBe(true);
    expect(canLeaveParty('organiser')).toMatchObject({
      ok: false,
      reason: 'organiser_cannot_leave',
    });
  });
});

describe('leavingLists', () => {
  it('takes my lists out, and finds those left in no party', () => {
    expect(
      leavingLists([
        { listId: 'l1', parties: 2 },
        { listId: 'l2', parties: 1 },
      ]),
    ).toEqual({ out: ['l1', 'l2'], alone: ['l2'] });
  });
});
