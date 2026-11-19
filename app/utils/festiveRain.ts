import { AVATAR_SHADES } from './avatars';

// The festive rain behind the last image of the palmarès (README 22.17,
// 23.5, maquette DevineStory7): snowflakes, four-pointed stars that
// twinkle, a few confetti. This draws its pieces, at random; the screen
// lets them fall.

/** The four-pointed star, in a box of 24. */
export const STAR_PATH =
  'M12 1C12.8 7.5 16.5 11.2 23 12C16.5 12.8 12.8 16.5 12 23C11.2 16.5 7.5 12.8 1 12C7.5 11.2 11.2 7.5 12 1Z';
/** A small snowflake: six plain arms. */
export const FLAKE_PATH =
  'M12 12L12.00 3.50M12 12L19.36 7.75M12 12L19.36 16.25M12 12L12.00 20.50M12 12L4.64 16.25M12 12L4.64 7.75';
/** A larger snowflake: six arms, each with two barbs. */
export const BRANCHED_FLAKE_PATH =
  'M12 12L12.00 2.00M12.00 5.80L9.38 3.96M12.00 5.80L14.62 3.96M12 12L20.66 7.00M17.37 8.90L17.65 5.71M17.37 8.90L20.27 10.25M12 12L20.66 17.00M17.37 15.10L20.27 13.75M17.37 15.10L17.65 18.29M12 12L12.00 22.00M12.00 18.20L14.62 20.04M12.00 18.20L9.38 20.04M12 12L3.34 17.00M6.63 15.10L6.35 18.29M6.63 15.10L3.73 13.75M12 12L3.34 7.00M6.63 8.90L3.73 10.25M6.63 8.90L6.35 5.71';

const { brick, pine, plum, frost, kraft } = AVATAR_SHADES;

/** One piece of the rain. */
export type RainPiece = {
  kind: 'flake' | 'branched' | 'star' | 'confetti';
  /** Where it falls from, in percent of the width. */
  left: number;
  opacity: number;
  /** How long a fall takes, and where in it the piece starts, in seconds. */
  duration: number;
  delay: number;
  /** How far it drifts sideways, in pixels, and how much it turns. */
  drift: number;
  turn: number;
  /** Where it rests when nothing moves, in percent of the height. */
  rest: number;
  color: string;
  width: number;
  height: number;
  /** A star's twinkle: its period and where in it the star starts. */
  twinkle?: { period: number; delay: number };
  /** A snowflake's line width. */
  stroke?: number;
  /** A confetti: a small rectangle, or a dot. */
  round?: boolean;
};

/** How many of each fall (the mockup's own dosage). */
export const RAIN_COUNTS = { flake: 7, branched: 17, star: 11, confetti: 12 };

/**
 * The pieces of the rain.
 * @param random - A number in [0, 1), `Math.random` in the browser.
 * @returns The pieces, each with its place, pace and look.
 */
export const festiveRain = (random: () => number): RainPiece[] => {
  const between = (min: number, max: number) => min + random() * (max - min);
  const round = (value: number, digits = 1) => Number(value.toFixed(digits));
  const pick = <T>(values: readonly T[]): T =>
    values[Math.floor(random() * values.length)]!;
  const base = (durations: [number, number], turns: [number, number]) => {
    const duration = round(between(...durations));
    return {
      left: round(between(2, 98)),
      duration,
      delay: -round(between(0, duration)),
      drift: Math.round(between(-40, 40)),
      turn: Math.round(between(...turns)),
      rest: Math.round(between(6, 92)),
    };
  };
  const side = (size: number) => ({ width: size, height: size });
  const pieces = (count: number, make: () => RainPiece) =>
    Array.from({ length: count }, make);
  return [
    ...pieces(RAIN_COUNTS.flake, () => ({
      kind: 'flake' as const,
      ...base([9.9, 15.9], [43, 198]),
      opacity: round(between(0.7, 0.95), 2),
      color: pick([frost.ring, frost.ring, plum.ring]),
      ...side(pick([12, 12, 14])),
      stroke: 2.6,
    })),
    ...pieces(RAIN_COUNTS.branched, () => {
      const size = pick([16, 20, 20, 24, 28, 28]);
      return {
        kind: 'branched' as const,
        ...base([9.7, 16.6], [43, 189]),
        opacity: round(between(0.72, 1), 2),
        color: pick([frost.ring, frost.ring, frost.bg, plum.ring]),
        ...side(size),
        stroke: size >= 28 ? 1.6 : size >= 24 ? 1.7 : size >= 20 ? 1.9 : 2.2,
      };
    }),
    ...pieces(RAIN_COUNTS.star, () => ({
      kind: 'star' as const,
      ...base([10.5, 17.9], [-25, 23]),
      opacity: 1,
      color: pick([brick.ring, plum.ring, plum.ring, pine.ring]),
      ...side(pick([12, 12, 14, 18, 22, 26])),
      twinkle: {
        period: round(between(1.6, 2.6)),
        delay: -round(between(0, 2.6)),
      },
    })),
    ...pieces(RAIN_COUNTS.confetti, () => ({
      kind: 'confetti' as const,
      ...base([6.2, 10.9], [404, 807]),
      opacity: 1,
      color: pick([
        'var(--ui-primary)',
        kraft.ring,
        brick.ring,
        brick.ring,
        pine.ring,
        plum.ring,
      ]),
      width: pick([6, 6, 8, 10]),
      height: pick([6, 6, 10, 14]),
      round: random() < 0.1,
    })),
  ];
};
