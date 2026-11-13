import type { AvatarColor } from '#server/utils/avatars';

// Shades of the art direction for avatar circles: soft background, and a
// border one step darker so the circle reads on white and on kraft.
export const AVATAR_SHADES: Record<
  AvatarColor,
  { label: string; bg: string; ring: string }
> = {
  brick: { label: 'Rouge brique', bg: '#f3d3cc', ring: '#e09e92' },
  pine: { label: 'Vert sapin', bg: '#cfe2d3', ring: '#8db898' },
  mustard: { label: 'Moutarde', bg: '#f6e3ad', ring: '#e6b94a' },
  kraft: { label: 'Kraft', bg: '#ecdfc6', ring: '#cdb48a' },
  frost: { label: 'Givre', bg: '#d6e6ef', ring: '#94bbd0' },
  plum: { label: 'Prune', bg: '#ead2e2', ring: '#c493b4' },
};
