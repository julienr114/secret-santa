// The icons as gradient stickers (README 23.5, « La forme des icônes »,
// lot 23 bis): a person is a round, a list a rounded square, tilted. A
// soft gradient, a white edge, a cast shadow; the edge and the shadow
// follow the size. The values are those of docs/refonte/sorbet/autocollant.py.

type Shade = { bg: string; ring: string };
type Sticker = Record<string, string>;

/** How far a tile of a list leans, to the left. */
export const TILE_TILT = 'rotate(-3deg)';

/**
 * The white edge of a sticker: 5 % of its size, 2 px at least.
 * @param size - Its diameter or side, in pixels.
 * @returns The width of the edge, in pixels.
 */
export const stickerEdge = (size: number): number =>
  Math.max(2, Math.round(size * 0.05));

/**
 * The shadow a sticker casts: shorter under 36 px.
 * @param size - Its diameter or side, in pixels.
 * @returns The shadow, as CSS.
 */
export const stickerShadow = (size: number): string =>
  size >= 36
    ? '0 3px 8px rgba(90, 40, 60, 0.22)'
    : '0 2px 5px rgba(90, 40, 60, 0.2)';

/**
 * The ground of a person's icon: white at the top left, the soft shade,
 * the deeper one at the bottom right.
 * @param shade - The two shades of the colour.
 * @returns The gradient, as CSS.
 */
export const personGradient = (shade: Shade): string =>
  `linear-gradient(150deg, #ffffff 0%, ${shade.bg} 42%, ${shade.ring} 135%)`;

/**
 * The ground of a list's tile: from the soft shade to the deeper one.
 * @param shade - The two shades of the colour.
 * @returns The gradient, as CSS.
 */
export const tileGradient = (shade: Shade): string =>
  `linear-gradient(150deg, ${shade.bg} 0%, ${shade.ring} 110%)`;

/**
 * The edge and the shadow of a sticker.
 * @param size - Its diameter or side, in pixels.
 * @returns The two as one `box-shadow`.
 */
const lift = (size: number): string =>
  `0 0 0 ${stickerEdge(size)}px #ffffff, ${stickerShadow(size)}`;

/**
 * A person's icon. Flat, the gradient alone: icons that overlap, a cell
 * or a colour of the icon picker, the images of the palmarès, which bring
 * their own ring.
 * @param shade - The two shades of the colour.
 * @param size - The diameter, in pixels.
 * @param flat - Whether to leave the edge and the shadow out.
 * @returns The style of the round.
 */
export const personSticker = (
  shade: Shade,
  size: number,
  flat = false,
): Sticker => ({
  backgroundImage: personGradient(shade),
  ...(flat ? {} : { boxShadow: lift(size) }),
});

/**
 * The tile of a list: corners of 30 % of its side, tilted. Flat, the
 * gradient alone and straight (the icon picker).
 * @param shade - The two shades of the colour.
 * @param size - The side, in pixels.
 * @param flat - Whether to leave the edge, the shadow and the tilt out.
 * @returns The style of the square.
 */
export const tileSticker = (
  shade: Shade,
  size: number,
  flat = false,
): Sticker => ({
  backgroundImage: tileGradient(shade),
  borderRadius: `${Math.round(size * 0.3)}px`,
  ...(flat ? {} : { boxShadow: lift(size), transform: TILE_TILT }),
});
