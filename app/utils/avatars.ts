import type { AvatarColor } from '#server/utils/avatars';

// Shades of the art direction for avatar circles: soft background, and a
// border one step darker so the circle reads on white and on kraft. The
// colour names live in shared/i18n (`adminGroup.avatar.colors.*`).
export const AVATAR_SHADES: Record<AvatarColor, { bg: string; ring: string }> =
  {
    brick: { bg: '#f3d3cc', ring: '#e09e92' },
    pine: { bg: '#cfe2d3', ring: '#8db898' },
    mustard: { bg: '#f6e3ad', ring: '#e6b94a' },
    kraft: { bg: '#ecdfc6', ring: '#cdb48a' },
    frost: { bg: '#d6e6ef', ring: '#94bbd0' },
    plum: { bg: '#ead2e2', ring: '#c493b4' },
  };
