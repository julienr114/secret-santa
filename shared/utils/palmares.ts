// The screens of the palmarès in images of « Devine qui » (README 22.17,
// maquettes DevineStory1 to 7): the opening, one's own Santa in two
// screens (left out for an organiser who does not take part), one screen
// per award won, the end. An award nobody won is not there.

/** The awards, in the order of the images. */
export type AwardKind =
  'unmasked' | 'detective' | 'transparent' | 'hidden' | 'suspect';

export type StoryScreen =
  | { kind: 'opening' }
  | { kind: 'suspense' }
  | { kind: 'santa' }
  | { kind: 'award'; award: AwardKind }
  | { kind: 'end' };

/** How long a screen stays, once the images are started. */
export const STORY_SECONDS = 7;

/**
 * The screens, in order.
 * @param p - The awards won, in order, and whether the reader has a Santa
 *   in this draw.
 * @returns The screens.
 */
export const storyScreens = (p: {
  awards: { kind: AwardKind }[];
  hasSanta: boolean;
}): StoryScreen[] => [
  { kind: 'opening' },
  ...(p.hasSanta ? ([{ kind: 'suspense' }, { kind: 'santa' }] as const) : []),
  ...p.awards.map((a) => ({ kind: 'award' as const, award: a.kind })),
  { kind: 'end' },
];

/**
 * The screen a tap leads to: the right part of the screen goes on, the
 * left part goes back; never past the ends.
 * @param at - The screen shown.
 * @param count - How many screens.
 * @param side - Where the tap was.
 * @returns The screen to show.
 */
export const storyStep = (
  at: number,
  count: number,
  side: 'left' | 'right',
): number =>
  side === 'right' ? Math.min(at + 1, count - 1) : Math.max(at - 1, 0);
