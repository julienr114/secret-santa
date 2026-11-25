import { describe, expect, it } from 'vitest';
import {
  CATEGORY_DEFAULTS,
  PARTY_CATEGORIES,
  categoryOfEmoji,
  newPartyDefaults,
  nextOccurrence,
  partyEmoji,
} from './categories';

describe('categories', () => {
  it('are the six of the spec, each with its defaults', () => {
    expect(PARTY_CATEGORIES).toEqual([
      'christmas',
      'birthday',
      'birth',
      'wedding',
      'housewarming',
      'other',
    ]);
    expect(Object.keys(CATEGORY_DEFAULTS)).toEqual([...PARTY_CATEGORIES]);
    expect(CATEGORY_DEFAULTS.christmas).toEqual({
      emoji: '🎄',
      form: 'everyone',
      usualDate: '12-25',
      recurring: true,
    });
  });

  it('finds the category of a list by its icon, else « other »', () => {
    expect(categoryOfEmoji('🎄')).toBe('christmas');
    expect(categoryOfEmoji('🎂')).toBe('birthday');
    expect(categoryOfEmoji('🍼')).toBe('birth');
    expect(categoryOfEmoji('💍')).toBe('wedding');
    expect(categoryOfEmoji('🏡')).toBe('housewarming');
    expect(categoryOfEmoji('❄️')).toBe('other');
    expect(categoryOfEmoji('✨')).toBe('other');
  });

  it('gives the party its own icon, else its category’s', () => {
    expect(partyEmoji({ category: 'christmas', iconEmoji: null })).toBe('🎄');
    expect(partyEmoji({ category: 'christmas', iconEmoji: '⭐' })).toBe('⭐');
    expect(partyEmoji({ category: 'other', iconEmoji: null })).toBe('✨');
  });
});

describe('nextOccurrence', () => {
  it('gives this year’s day, or next year’s once past', () => {
    expect(nextOccurrence('12-25', '2026-11-20')).toBe('2026-12-25');
    expect(nextOccurrence('12-25', '2026-12-25')).toBe('2026-12-25');
    expect(nextOccurrence('03-14', '2026-11-20')).toBe('2027-03-14');
  });
});

describe('newPartyDefaults', () => {
  const today = '2026-11-20';
  it('fills Christmas with 25 December, every year', () => {
    expect(newPartyDefaults('christmas', { today })).toEqual({
      date: '2026-12-25',
      recurring: true,
    });
  });

  it('fills a birthday with the next birthday of the one it is for', () => {
    expect(
      newPartyDefaults('birthday', { today, birthDate: '2022-12-14' }),
    ).toEqual({ date: '2026-12-14', recurring: true });
    expect(newPartyDefaults('birthday', { today })).toEqual({
      date: null,
      recurring: true,
    });
  });

  it('leaves the date to enter for the others, once', () => {
    expect(newPartyDefaults('wedding', { today })).toEqual({
      date: null,
      recurring: false,
    });
    expect(newPartyDefaults('other', { today }).recurring).toBe(false);
  });
});
