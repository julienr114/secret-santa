import { describe, expect, it } from 'vitest';
import {
  CATEGORY_DEFAULTS,
  PARTY_CATEGORIES,
  categoryOfEmoji,
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
  });

  it('gives the party its own icon, else its category’s', () => {
    expect(partyEmoji({ category: 'christmas', iconEmoji: null })).toBe('🎄');
    expect(partyEmoji({ category: 'christmas', iconEmoji: '⭐' })).toBe('⭐');
    expect(partyEmoji({ category: 'other', iconEmoji: null })).toBeNull();
  });
});
