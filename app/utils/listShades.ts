import type { ListColor } from '#server/utils/lists';
import { AVATAR_SHADES } from './avatars';

// The colours of a list's square tile (README 23.5, « La forme des
// icônes »): the six shades of the people, under the six names stored for
// a list. A list and a person of the same shade differ by their shape.
export const LIST_SHADES: Record<ListColor, { bg: string; ring: string }> = {
  pine: AVATAR_SHADES.pine,
  brick: AVATAR_SHADES.brick,
  mustard: AVATAR_SHADES.mustard,
  plum: AVATAR_SHADES.plum,
  night: AVATAR_SHADES.frost,
  kraft: AVATAR_SHADES.kraft,
};

/**
 * The shade of a list's colour, the first one for an unknown colour.
 * @param color - The colour stored.
 * @returns Its ground and edge.
 */
export const listShade = (color: string) =>
  LIST_SHADES[color as ListColor] ?? LIST_SHADES.pine;
