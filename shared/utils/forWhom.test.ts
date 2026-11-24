import { describe, expect, it } from 'vitest';
import { ageIn, forWhomOf } from './forWhom';

const zoe = {
  id: 'z',
  accountId: 'camille',
  firstName: 'Zoé',
  birthDate: '2022-12-14',
  isSelf: false,
  linkedAccountId: null,
};

describe('ageIn', () => {
  it('gives the age turned that year', () => {
    expect(ageIn('2022-12-14', 2026)).toBe(4);
    expect(ageIn('2022-12-14', 2025)).toBe(3);
  });

  it('says nothing without a birth date, or before the first birthday', () => {
    expect(ageIn(null, 2026)).toBeNull();
    expect(ageIn('2026-03-01', 2026)).toBeNull();
    expect(ageIn('2026-03-01', 2024)).toBeNull();
  });
});

describe('forWhomOf', () => {
  const base = {
    category: 'birthday' as const,
    member: zoe,
    viewer: 'camille',
    year: 2026,
  };

  it('gives the first name and the age, and the person to the one who has them', () => {
    expect(forWhomOf(base)).toEqual({
      firstName: 'Zoé',
      age: 4,
      me: false,
      memberId: 'z',
    });
  });

  it('keeps the person from the others', () => {
    expect(forWhomOf({ ...base, viewer: 'mamie' })).toEqual({
      firstName: 'Zoé',
      age: 4,
      me: false,
      memberId: null,
    });
  });

  it('says it is me for my own, or for the person linked to my account', () => {
    expect(forWhomOf({ ...base, member: { ...zoe, isSelf: true } })?.me).toBe(
      true,
    );
    expect(
      forWhomOf({ ...base, member: { ...zoe, isSelf: true }, viewer: 'mamie' })
        ?.me,
    ).toBe(false);
    expect(
      forWhomOf({
        ...base,
        member: { ...zoe, linkedAccountId: 'zoe' },
        viewer: 'zoe',
      })?.me,
    ).toBe(true);
  });

  it('says no age without a birth date or without a year', () => {
    expect(
      forWhomOf({ ...base, member: { ...zoe, birthDate: null } })?.age,
    ).toBeNull();
    expect(forWhomOf({ ...base, year: null })?.age).toBeNull();
  });

  it('says nothing without a person, or for another category', () => {
    expect(forWhomOf({ ...base, member: null })).toBeNull();
    expect(forWhomOf({ ...base, member: undefined })).toBeNull();
    expect(forWhomOf({ ...base, category: 'christmas' })).toBeNull();
  });
});
