import type { AwardKind } from '#server/utils/awards';

// The screens of the palmarès of « Devine qui » in images (README 22.17,
// maquettes DevineStory*): the opening, one's own Santa in two screens
// (left out for an organiser who does not take part), « Si près du but »
// for its player only, one screen per award shown, the end.

export type { AwardKind };

export type StoryScreen =
  | { kind: 'opening' }
  | { kind: 'suspense' }
  | { kind: 'santa' }
  | { kind: 'closeCall' }
  | { kind: 'award'; award: AwardKind }
  | { kind: 'end' };

/** How long a screen stays, once the images are started. */
export const STORY_SECONDS = 7;

/**
 * The screens, in order.
 * @param p - The awards shown, in order; whether the reader has a Santa in
 *   this draw, and a line where they were so close (« Si près du but »).
 * @returns The screens.
 */
export const storyScreens = (p: {
  awards: { kind: AwardKind }[];
  hasSanta: boolean;
  closeCall?: boolean;
}): StoryScreen[] => [
  { kind: 'opening' },
  ...(p.hasSanta ? ([{ kind: 'suspense' }, { kind: 'santa' }] as const) : []),
  ...(p.closeCall ? ([{ kind: 'closeCall' }] as const) : []),
  ...p.awards.map((a) => ({ kind: 'award' as const, award: a.kind })),
  { kind: 'end' },
];

/** The colours of the screens. */
export type StoryLook = 'pine' | 'brick' | 'mustard' | 'plum' | 'cream';
/** The award screens take these in turn, by their rank among those shown. */
export const AWARD_LOOKS = ['mustard', 'plum', 'pine', 'brick'] as const;
const FIXED_LOOKS = {
  opening: 'pine',
  suspense: 'brick',
  santa: 'brick',
  closeCall: 'brick',
  end: 'cream',
} as const;

/**
 * The colour of each screen (README 22.17): the fixed screens keep theirs,
 * the awards turn mustard, plum, pine, brick, by rank; no award has a
 * colour of its own, and two neighbours never share one.
 * @param screens - The screens, in order.
 * @returns One colour per screen.
 */
export const storyLooks = (screens: StoryScreen[]): StoryLook[] =>
  screens.map((screen, index) =>
    screen.kind === 'award'
      ? AWARD_LOOKS[
          screens.slice(0, index).filter((s) => s.kind === 'award').length %
            AWARD_LOOKS.length
        ]!
      : FIXED_LOOKS[screen.kind],
  );

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

/**
 * What one's own Santa screen says to a reader who made no guess: « L'an
 * prochain ? » only in a party that comes back each year (docs/spec/v3/
 * vocabulaire.md, Q-027).
 * @param recurring - Whether the party comes back each year.
 * @returns The key of the text.
 */
export const noGuessKey = (recurring: boolean): string =>
  recurring
    ? 'participant.game.story.noGuessBody'
    : 'participant.game.story.noGuessBodyOnce';

/** The texts of the last screen: their keys, before « Père Noël » is chosen. */
export type StoryEnd = {
  eyebrow: string;
  title: string;
  params?: { name: string };
};

/**
 * The last screen (DevineStory7, docs/spec/v3/vocabulaire.md, « Devine
 * qui hors de Noël »): « C'est tout pour cette année » in a party that
 * comes back each year, « C'est tout » otherwise; then the reader's first
 * name, or none for an organiser who does not play. Outside Christmas,
 * the title reads its variant (« Merci d'avoir joué »), as every text with
 * « Noël » does.
 * @param p - Whether the party comes back each year; the reader's first
 *   name, or null.
 * @returns The keys and the name.
 */
export const storyEnd = (p: {
  recurring: boolean;
  firstName: string | null;
}): StoryEnd => ({
  eyebrow: p.recurring
    ? 'participant.game.story.endEyebrow'
    : 'participant.game.story.endEyebrowOnce',
  ...(p.firstName
    ? {
        title: 'participant.game.story.endTitle',
        params: { name: p.firstName },
      }
    : { title: 'participant.game.story.endTitleAlone' }),
});
