import { describe, expect, it } from 'vitest';
import { festiveRain, RAIN_COUNTS } from './festiveRain';

/** A repeatable sequence in [0, 1). */
const sequence = () => {
  const values = Array.from(
    { length: 2000 },
    (_, index) => ((index * 7919 + 13) % 1000) / 1000,
  )[Symbol.iterator]();
  return () => values.next().value ?? 0;
};

describe('festive rain', () => {
  it('draws the dosage of the mockup', () => {
    const pieces = festiveRain(sequence());
    const count = (kind: string) =>
      pieces.filter((piece) => piece.kind === kind).length;
    expect(count('flake')).toBe(RAIN_COUNTS.flake);
    expect(count('branched')).toBe(RAIN_COUNTS.branched);
    expect(count('star')).toBe(RAIN_COUNTS.star);
    expect(count('confetti')).toBe(RAIN_COUNTS.confetti);
  });

  it('keeps every piece on the screen, already falling', () => {
    for (const piece of festiveRain(sequence())) {
      expect(piece.left).toBeGreaterThanOrEqual(2);
      expect(piece.left).toBeLessThanOrEqual(98);
      expect(piece.rest).toBeGreaterThanOrEqual(6);
      expect(piece.rest).toBeLessThanOrEqual(92);
      expect(piece.delay).toBeLessThanOrEqual(0);
      expect(-piece.delay).toBeLessThanOrEqual(piece.duration);
      expect(piece.opacity).toBeGreaterThan(0.6);
    }
  });

  it('makes only the stars twinkle', () => {
    for (const piece of festiveRain(sequence())) {
      expect(Boolean(piece.twinkle)).toBe(piece.kind === 'star');
    }
  });
});
