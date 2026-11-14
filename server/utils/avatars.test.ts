import { describe, it, expect } from 'vitest';
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  avatarOf,
  randomAvatar,
} from './avatars';

describe('avatars', () => {
  it('picks a random emoji and colour from the lists', () => {
    expect(randomAvatar(() => 0)).toEqual({
      emoji: AVATAR_EMOJIS[0],
      color: AVATAR_COLORS[0],
    });
    expect(randomAvatar((n) => n - 1)).toEqual({
      emoji: AVATAR_EMOJIS.at(-1),
      color: AVATAR_COLORS.at(-1),
    });
  });

  it('keeps a stored avatar', () => {
    expect(
      avatarOf({ id: 'x', avatarEmoji: '🦊', avatarColor: 'pine' }),
    ).toEqual({
      emoji: '🦊',
      color: 'pine',
    });
  });

  it('derives a stable default from the id, also for invalid stored values', () => {
    const first = avatarOf({ id: 'person-1' });
    expect(avatarOf({ id: 'person-1', avatarEmoji: null })).toEqual(first);
    expect(
      avatarOf({ id: 'person-1', avatarEmoji: '🍕', avatarColor: 'neon' }),
    ).toEqual(first);
    expect(AVATAR_EMOJIS).toContain(first.emoji);
    expect(AVATAR_COLORS).toContain(first.color);
  });

  it('replaces a stored emoji that is no longer offered, keeping the colour', () => {
    expect(AVATAR_EMOJIS).not.toContain('🔔');
    expect(
      avatarOf({ id: 'person-1', avatarEmoji: '🔔', avatarColor: 'plum' }),
    ).toEqual({ emoji: avatarOf({ id: 'person-1' }).emoji, color: 'plum' });
  });

  it('spreads defaults across the lists', () => {
    const emojis = new Set(
      Array.from({ length: 200 }, (_, i) => avatarOf({ id: `p${i}` }).emoji),
    );
    const colors = new Set(
      Array.from({ length: 200 }, (_, i) => avatarOf({ id: `p${i}` }).color),
    );
    expect(emojis.size).toBeGreaterThan(15);
    expect(colors.size).toBe(AVATAR_COLORS.length);
  });
});
