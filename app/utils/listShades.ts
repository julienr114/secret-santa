import type { ListColor } from '#server/utils/lists';

// The six solid colours of a list's square tile (README 22.19): the ground
// of the tile, and its edge.
export const LIST_SHADES: Record<ListColor, { bg: string; ring: string }> = {
  pine: { bg: '#274e34', ring: '#1d3b27' },
  brick: { bg: '#a43a2f', ring: '#8a2f27' },
  mustard: { bg: '#e6b94a', ring: '#c99a2e' },
  plum: { bg: '#5b3a55', ring: '#472c42' },
  night: { bg: '#2c4a63', ring: '#22394d' },
  kraft: { bg: '#b89565', ring: '#9c7a4c' },
};

/**
 * The shade of a list's colour, the first one for an unknown colour.
 * @param color - The colour stored.
 * @returns Its ground and edge.
 */
export const listShade = (color: string) =>
  LIST_SHADES[color as ListColor] ?? LIST_SHADES.pine;
