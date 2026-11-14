import { z } from 'zod';

// Person avatars: a Christmas emoji in a coloured circle. Colours are keys
// of the art direction palette; the app maps them to actual shades.

export const AVATAR_EMOJIS = [
  '🎅',
  '🤶',
  '🧝',
  '🦌',
  '⛄',
  '🎄',
  '🎁',
  '🌟',
  '❄️',
  '🍪',
  '🥛',
  '🧦',
  '🧣',
  '🧤',
  '🍬',
  '🍭',
  '🎀',
  '🐧',
  '🦊',
  '🦉',
  '🍫',
  // Christmas market
  '🥨',
  '🍷',
  '🌰',
  '🍎',
  '🍊',
  '🫕',
  '🎠',
  '⛸️',
  '🛷',
] as const;
export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];

// The first set, used for the default avatar derived from an id: kept
// apart so that adding emojis never changes someone's existing default.
const DEFAULT_EMOJIS = AVATAR_EMOJIS.slice(0, 21);

export const AVATAR_COLORS = [
  'brick',
  'pine',
  'mustard',
  'kraft',
  'frost',
  'plum',
] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export type Avatar = { emoji: AvatarEmoji; color: AvatarColor };

export const avatarEmojiSchema = z.enum(AVATAR_EMOJIS);
export const avatarColorSchema = z.enum(AVATAR_COLORS);

const pick = <T>(items: readonly T[], index: number): T =>
  items[index % items.length] as T;

/** A random avatar for a new person; randomness is injected. */
export const randomAvatar = (random: (n: number) => number): Avatar => ({
  emoji: pick(AVATAR_EMOJIS, random(AVATAR_EMOJIS.length)),
  color: pick(AVATAR_COLORS, random(AVATAR_COLORS.length)),
});

// FNV-1a: a small, stable string hash.
const hash = (text: string): number =>
  [...text].reduce(
    (h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );

/**
 * The avatar of a person: the stored one when valid, otherwise a stable
 * default derived from the id (people created before avatars existed).
 */
export const avatarOf = (person: {
  id: string;
  avatarEmoji?: string | null;
  avatarColor?: string | null;
}): Avatar => {
  const h = hash(person.id);
  const emoji = avatarEmojiSchema.safeParse(person.avatarEmoji);
  const color = avatarColorSchema.safeParse(person.avatarColor);
  return {
    emoji: emoji.success ? emoji.data : pick(DEFAULT_EMOJIS, h),
    color: color.success ? color.data : pick(AVATAR_COLORS, h >>> 8),
  };
};
