import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { storyLooks, storyScreens, storyStep } from './palmares';

describe('storyScreens', () => {
  it('opens, shows one’s own Santa, each award won, then ends', () => {
    expect(
      storyScreens({
        awards: [{ kind: 'detective' }, { kind: 'hidden' }],
        hasSanta: true,
      }).map((s) => (s.kind === 'award' ? s.award : s.kind)),
    ).toEqual(['opening', 'suspense', 'santa', 'detective', 'hidden', 'end']);
  });

  it('leaves one’s own Santa out for an organiser who does not play', () => {
    expect(
      storyScreens({ awards: [{ kind: 'suspect' }], hasSanta: false }).map(
        (s) => s.kind,
      ),
    ).toEqual(['opening', 'award', 'end']);
  });
});

describe('« Si près du but » and the colours', () => {
  it('puts « Si près du but » right after one’s own Santa', () => {
    expect(
      storyScreens({
        awards: [{ kind: 'unmasked' }],
        hasSanta: true,
        closeCall: true,
      }).map((s) => s.kind),
    ).toEqual(['opening', 'suspense', 'santa', 'closeCall', 'award', 'end']);
  });

  it('turns the award colours by rank, the fixed screens keeping theirs', () => {
    const screens = storyScreens({
      awards: [
        { kind: 'unmasked' },
        { kind: 'hidden' },
        { kind: 'suspect' },
        { kind: 'twins' },
        { kind: 'group' },
      ],
      hasSanta: true,
    });
    expect(storyLooks(screens)).toEqual([
      'pine',
      'brick',
      'brick',
      'mustard',
      'plum',
      'pine',
      'brick',
      'mustard',
      'cream',
    ]);
  });

  it('never gives two award neighbours the same colour', () => {
    const KINDS = ['unmasked', 'hidden', 'rumour', 'group'] as const;
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...KINDS), { maxLength: 10 }),
        fc.boolean(),
        fc.boolean(),
        (kinds, hasSanta, closeCall) => {
          const screens = storyScreens({
            awards: kinds.map((kind) => ({ kind })),
            hasSanta,
            closeCall: hasSanta && closeCall,
          });
          const looks = storyLooks(screens);
          return looks.every(
            (look, i) =>
              i === 0 ||
              look !== looks[i - 1] ||
              // Suspense, Santa and « Si près du but » are all brick.
              (screens[i]!.kind !== 'award' &&
                screens[i - 1]!.kind !== 'award'),
          );
        },
      ),
    );
  });
});

describe('storyStep', () => {
  it('goes on to the right, back to the left, never past the ends', () => {
    expect(storyStep(0, 5, 'right')).toBe(1);
    expect(storyStep(4, 5, 'right')).toBe(4);
    expect(storyStep(2, 5, 'left')).toBe(1);
    expect(storyStep(0, 5, 'left')).toBe(0);
  });
});
