import { describe, expect, it } from 'vitest';
import { storyScreens, storyStep } from './palmares';

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

describe('storyStep', () => {
  it('goes on to the right, back to the left, never past the ends', () => {
    expect(storyStep(0, 5, 'right')).toBe(1);
    expect(storyStep(4, 5, 'right')).toBe(4);
    expect(storyStep(2, 5, 'left')).toBe(1);
    expect(storyStep(0, 5, 'left')).toBe(0);
  });
});
