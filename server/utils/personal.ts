import { ok, fail, type Result } from './result';
import type { EditionStatus } from './editions';

// The participant's side of an edition (README 4.3): what the personal
// page shows and what the link allows, from the edition status alone.

export const PERSONAL_PHASES = ['waiting', 'ready', 'closed'] as const;
export type PersonalPhase = (typeof PERSONAL_PHASES)[number];

/** Which screen the personal page shows. */
export const personalPhase = (status: EditionStatus): PersonalPhase =>
  status === 'drawn' ? 'ready' : status === 'closed' ? 'closed' : 'waiting';

/** The result exists once the draw is done, and stays readable after. */
export const canReveal = (status: EditionStatus): Result<true> =>
  status === 'drawn' || status === 'closed' ? ok(true) : fail('draw_not_done');

/**
 * A wish list is editable from the creation of the edition until it is closed
 * (README 6 bis.1), and only if the group uses wish lists.
 */
export const canEditWishes = (
  status: EditionStatus,
  { wishlist }: { wishlist: boolean },
): Result<true> => {
  if (!wishlist) return fail('wishlist_disabled');
  if (status === 'closed') return fail('edition_closed');
  return ok(true);
};

/** A participant may change their own avatar until the edition is closed. */
export const canEditAvatar = (status: EditionStatus): Result<true> =>
  status === 'closed' ? fail('edition_closed') : ok(true);

export const DRAW_STEPS = [
  'addWishes',
  'wait',
  'discover',
  'seeAgain',
  'closed',
] as const;
export type DrawStep = (typeof DRAW_STEPS)[number];

/**
 * What a participant has to do next, for the home page.
 * @param draw - Status of the edition, whether the result was already
 *   seen, whether the group uses wish lists and how many ideas they wrote.
 * @returns The next step.
 */
export const nextStep = (draw: {
  status: EditionStatus;
  revealed: boolean;
  wishlist: boolean;
  wishesCount: number;
}): DrawStep => {
  if (draw.status === 'closed') return 'closed';
  if (draw.status === 'drawn') return draw.revealed ? 'seeAgain' : 'discover';
  return draw.wishlist && draw.wishesCount === 0 ? 'addWishes' : 'wait';
};
