import { describe, expect, it } from 'vitest';
import {
  MAX_PARTY_MEMBERS,
  membersLeft,
  canLeaveParty,
  checkPartySize,
  leavingLists,
  partyInputSchema,
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

describe('checkPartySize', () => {
  it('allows thirty members, not more', () => {
    expect(checkPartySize(MAX_PARTY_MEMBERS).ok).toBe(true);
    expect(checkPartySize(MAX_PARTY_MEMBERS + 1)).toMatchObject({
      ok: false,
      reason: 'too_many_members',
    });
  });
});

describe('membersLeft', () => {
  it('leaves room up to thirty, never below zero', () => {
    expect(membersLeft(0)).toBe(MAX_PARTY_MEMBERS);
    expect(membersLeft(28)).toBe(2);
    expect(membersLeft(31)).toBe(0);
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
