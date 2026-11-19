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
  // Added on 18 November 2026, with those removed on 14 November back:
  // only ever appended, so that no default avatar changes.
  '🧑‍🎄',
  '🧝‍♀️',
  '🧝‍♂️',
  '👼',
  '☃️',
  '🫎',
  '🐻‍❄️',
  '🐻',
  '🐿️',
  '🦔',
  '🐺',
  '🐇',
  '🦭',
  '🐑',
  '🦃',
  '🕊️',
  '🐦',
  '🐈',
  '🐕',
  '🍰',
  '🧁',
  '🥧',
  '🍮',
  '🍯',
  '🥐',
  '🧇',
  '🥞',
  '🍐',
  '🍇',
  '🥕',
  '🧀',
  '🍗',
  '🥂',
  '🍾',
  '☕',
  '🫖',
  '🎿',
  '🏂',
  '🏒',
  '🎡',
  '🎶',
  '🎺',
  '🎻',
  '🎲',
  '🧩',
  '♟️',
  '🃏',
  '🌲',
  '✨',
  '🌨️',
  '🔔',
  '🕯️',
  '🔥',
  '🪵',
  '🧥',
  '🧸',
  '🚂',
  '🏔️',
  '🏡',
  '🎊',
  // Drinks, a family of their own (18 November 2026).
  '🍵',
  '🍺',
  '🥃',
  '🫗',
  // Not only Christmas (lot 20, 18 November 2026): children and games,
  // more people, animals and treats, nature, pastimes.
  '🚀',
  '🦄',
  '🪀',
  '⚽',
  '🎨',
  '🚲',
  '🛹',
  '🎮',
  '🪄',
  '🎈',
  '🪁',
  '🏀',
  '🤖',
  '🦖',
  '🧚',
  '🦸',
  '🧙',
  '🤴',
  '👸',
  '🥷',
  '🧜',
  '🤠',
  '🧑‍🚀',
  '🧑‍🍳',
  '🐼',
  '🐨',
  '🦁',
  '🐯',
  '🐸',
  '🐵',
  '🐢',
  '🦋',
  '🐝',
  '🐞',
  '🦒',
  '🐘',
  '🐬',
  '🐙',
  '🦩',
  '🦜',
  '🐴',
  '🍕',
  '🍓',
  '🍉',
  '🍦',
  '🍩',
  '🍒',
  '🍌',
  '🍑',
  '🥑',
  '🍿',
  '🍔',
  '🌻',
  '🌈',
  '🌙',
  '☀️',
  '🌊',
  '🌵',
  '🍀',
  '🌸',
  '🌷',
  '🍁',
  '🍄',
  '⭐',
  '🪐',
  '🌍',
  '🎸',
  '🎧',
  '📚',
  '📷',
  '🏕️',
  '✈️',
  '🎾',
  '🏄',
  '🧗',
  '🎭',
  '🎤',
  '🥁',
  // Correction 22 (19 November 2026): sailing, and the pastimes next to it.
  '⛵',
  '🎣',
  '🚴',
  '🏊',
  '🥾',
] as const;
export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];

/** The families of emojis, in the order of the choice, like a keyboard. */
export const AVATAR_GROUP_KEYS = [
  'kids',
  'people',
  'animals',
  'food',
  'drinks',
  'activities',
  'nature',
  'decor',
] as const;
export type AvatarGroupKey = (typeof AVATAR_GROUP_KEYS)[number];

/**
 * The emojis ranged by family for the choice (18 November 2026; children
 * and games first, and nature, since lot 20): people, animals, treats,
 * drinks, activities, nature, then the decor of Christmas. Each
 * emoji of AVATAR_EMOJIS is in one family exactly (tested).
 */
export const AVATAR_GROUPS: Record<AvatarGroupKey, readonly AvatarEmoji[]> = {
  kids: [
    '🚀',
    '🦄',
    '🧸',
    '🪀',
    '⚽',
    '🎨',
    '🚲',
    '🎲',
    '🛹',
    '🎮',
    '🪄',
    '🎈',
    '🪁',
    '🏀',
    '🤖',
    '🦖',
  ],
  people: [
    '🎅',
    '🤶',
    '🧑‍🎄',
    '🧝',
    '🧝‍♀️',
    '🧝‍♂️',
    '👼',
    '⛄',
    '☃️',
    '🧚',
    '🦸',
    '🧙',
    '🤴',
    '👸',
    '🥷',
    '🧜',
    '🤠',
    '🧑‍🚀',
    '🧑‍🍳',
  ],
  animals: [
    '🦌',
    '🫎',
    '🐧',
    '🦊',
    '🦉',
    '🐻‍❄️',
    '🐻',
    '🐿️',
    '🦔',
    '🐺',
    '🐇',
    '🦭',
    '🐑',
    '🦃',
    '🕊️',
    '🐦',
    '🐈',
    '🐕',
    '🐼',
    '🐨',
    '🦁',
    '🐯',
    '🐸',
    '🐵',
    '🐢',
    '🦋',
    '🐝',
    '🐞',
    '🦒',
    '🐘',
    '🐬',
    '🐙',
    '🦩',
    '🦜',
    '🐴',
  ],
  food: [
    '🍪',
    '🍫',
    '🍬',
    '🍭',
    '🍰',
    '🧁',
    '🥧',
    '🍮',
    '🍯',
    '🥨',
    '🥐',
    '🧇',
    '🥞',
    '🌰',
    '🍎',
    '🍊',
    '🍐',
    '🍇',
    '🥕',
    '🧀',
    '🫕',
    '🍗',
    '🍕',
    '🍓',
    '🍉',
    '🍦',
    '🍩',
    '🍒',
    '🍌',
    '🍑',
    '🥑',
    '🍿',
    '🍔',
  ],
  drinks: ['🥛', '☕', '🍵', '🫖', '🍷', '🥂', '🍾', '🍺', '🥃', '🫗'],
  activities: [
    '⛸️',
    '🛷',
    '🎿',
    '🏂',
    '🏒',
    '🎠',
    '🎡',
    '🎶',
    '🎺',
    '🎻',
    '🧩',
    '♟️',
    '🃏',
    '🎸',
    '🎧',
    '📚',
    '📷',
    '🏕️',
    '✈️',
    '🎾',
    '🏄',
    '⛵',
    '🏊',
    '🎣',
    '🚴',
    '🥾',
    '🧗',
    '🎭',
    '🎤',
    '🥁',
  ],
  nature: [
    '🌻',
    '🌈',
    '🌙',
    '☀️',
    '🌊',
    '🌵',
    '🍀',
    '🌸',
    '🌷',
    '🍁',
    '🍄',
    '⭐',
    '🪐',
    '🌍',
  ],
  decor: [
    '🎄',
    '🌲',
    '🎁',
    '🎀',
    '🌟',
    '✨',
    '❄️',
    '🌨️',
    '🔔',
    '🕯️',
    '🔥',
    '🪵',
    '🧦',
    '🧣',
    '🧤',
    '🧥',
    '🚂',
    '🏔️',
    '🏡',
    '🎊',
  ],
};

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

/**
 * The icon of a new person of a group: a combination of emoji and colour
 * nobody of the group has yet, an emoji nobody has if there is one left;
 * any when every combination is taken (18 November 2026).
 * @param taken - The icons of the group's persons.
 * @param random - A random integer below its argument.
 * @returns The icon.
 */
export const freshAvatar = (
  taken: readonly Avatar[],
  random: (n: number) => number,
): Avatar => {
  const used = new Set(taken.map((a) => `${a.emoji} ${a.color}`));
  const usedEmojis = new Set(taken.map((a) => a.emoji));
  const free = AVATAR_EMOJIS.flatMap((emoji) =>
    AVATAR_COLORS.map((color) => ({ emoji, color })),
  ).filter((a) => !used.has(`${a.emoji} ${a.color}`));
  const unseen = free.filter((a) => !usedEmojis.has(a.emoji));
  const pool = unseen.length > 0 ? unseen : free;
  return pool.length > 0 ? pool[random(pool.length)]! : randomAvatar(random);
};

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
