import { describe, it, expect } from 'vitest';
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  AVATAR_GROUPS,
  freshAvatar,
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
      avatarOf({ id: 'person-1', avatarEmoji: '🌭', avatarColor: 'neon' }),
    ).toEqual(first);
    expect(AVATAR_EMOJIS).toContain(first.emoji);
    expect(AVATAR_COLORS).toContain(first.color);
  });

  it('replaces a stored emoji that is not offered, keeping the colour', () => {
    expect(AVATAR_EMOJIS).not.toContain('🌭');
    expect(
      avatarOf({ id: 'person-1', avatarEmoji: '🌭', avatarColor: 'plum' }),
    ).toEqual({ emoji: avatarOf({ id: 'person-1' }).emoji, color: 'plum' });
  });

  it('ranges every emoji in one family exactly', () => {
    const ranged = Object.values(AVATAR_GROUPS).flat();
    expect(ranged.toSorted()).toEqual([...AVATAR_EMOJIS].toSorted());
    expect(new Set(ranged).size).toBe(ranged.length);
  });

  it('keeps the first emojis in place, so defaults never change', () => {
    expect(AVATAR_EMOJIS.slice(0, 5)).toEqual(['🎅', '🤶', '🧝', '🦌', '⛄']);
    expect(AVATAR_EMOJIS[20]).toBe('🍫');
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

describe('freshAvatar', () => {
  it('gives an emoji nobody of the group has, while there is one', () => {
    const taken = AVATAR_EMOJIS.slice(0, -1).map((emoji) => ({
      emoji,
      color: AVATAR_COLORS[0],
    }));
    expect(freshAvatar(taken, () => 0).emoji).toBe(AVATAR_EMOJIS.at(-1));
  });

  it('then a combination nobody has', () => {
    const taken = AVATAR_EMOJIS.map((emoji) => ({
      emoji,
      color: AVATAR_COLORS[0],
    }));
    const avatar = freshAvatar(taken, () => 0);
    expect(avatar).toEqual({
      emoji: AVATAR_EMOJIS[0],
      color: AVATAR_COLORS[1],
    });
  });

  it('still gives one when every combination is taken', () => {
    const taken = AVATAR_EMOJIS.flatMap((emoji) =>
      AVATAR_COLORS.map((color) => ({ emoji, color })),
    );
    expect(AVATAR_EMOJIS).toContain(freshAvatar(taken, () => 0).emoji);
  });
});
