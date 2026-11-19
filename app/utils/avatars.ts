import type { AvatarColor } from '#server/utils/avatars';

// The shades of the avatar circles, « Sorbet » (README 23.5): a soft
// ground, and an edge a step deeper so the circle reads on white and on
// the page. The six stored names do not change; they now show as coral,
// mint, lemon, peach, sky and lilac (`adminGroup.avatar.colors.*`).
export const AVATAR_SHADES: Record<AvatarColor, { bg: string; ring: string }> =
  {
    brick: { bg: '#ffd0c8', ring: '#ff8478' },
    pine: { bg: '#c6f1e2', ring: '#4fcaa3' },
    mustard: { bg: '#ffe9a8', ring: '#f4b82e' },
    kraft: { bg: '#ffe2c4', ring: '#f2a65a' },
    frost: { bg: '#cfe6ff', ring: '#6eb0f2' },
    plum: { bg: '#e6d6f8', ring: '#b993dd' },
  };
