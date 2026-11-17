import { ok, fail, type Result } from './result';
import type { EditionStatus } from './editions';
import { daysUntil, isIsoDay } from './rules';

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

/** Where a step of the participant's timeline stands. */
export type StepState = 'done' | 'current' | 'todo';

/**
 * What a step says beside its name: the draw is soon or done; the party
 * is in some days, today, or over. Null when there is nothing to add.
 */
export type StepNote = 'soon' | 'done' | 'inDays' | 'today' | 'over' | null;

/** One step of the participant's timeline. */
export type ParticipantStep = {
  key: 'invitation' | 'draw' | 'party';
  state: StepState;
  note: StepNote;
  /** Days left before the party, with the note `inDays`. */
  days?: number;
};

/**
 * What the party step says: in how many days, today, or over. Nothing
 * without a real date.
 * @param eventDate - The date of the party, if any.
 * @param today - ISO day.
 * @returns The note, with the days left when there are some.
 */
const partyNote = (
  eventDate: string | null | undefined,
  today: string,
): Pick<ParticipantStep, 'note' | 'days'> => {
  if (!isIsoDay(eventDate)) return { note: null };
  const days = daysUntil(eventDate, today);
  if (days === null) return { note: 'over' };
  return days === 0 ? { note: 'today' } : { note: 'inDays', days };
};

/**
 * The three steps of the participant's timeline: the invitation (done as
 * soon as they have their link), the draw, then the party.
 * @param phase - What the personal page shows.
 * @param eventDate - The date of the party, if any.
 * @param today - ISO day.
 * @returns The invitation, the draw and the party, with where each stands.
 */
export const participantSteps = (
  phase: PersonalPhase,
  eventDate: string | null | undefined,
  today: string,
): ParticipantStep[] => [
  { key: 'invitation', state: 'done', note: null },
  {
    key: 'draw',
    state: phase === 'closed' ? 'done' : 'current',
    note: phase === 'waiting' ? 'soon' : 'done',
  },
  phase === 'closed'
    ? { key: 'party', state: 'done', note: 'over' }
    : { key: 'party', state: 'todo', ...partyNote(eventDate, today) },
];

/** How the envelope of the page is drawn. */
export type EnvelopeState = 'pending' | 'sealed' | 'opened' | 'locked';

/**
 * The envelope of the personal page: locked on a refused link, waiting
 * before the draw, then sealed until the result was seen once, opened
 * after.
 * @param phase - What the personal page shows.
 * @param revealed - The result was already seen.
 * @param hasError - The link was refused.
 * @returns The state of the envelope.
 */
export const envelopeState = (
  phase: PersonalPhase,
  revealed: boolean,
  hasError: boolean,
): EnvelopeState => {
  if (hasError) return 'locked';
  if (phase === 'waiting') return 'pending';
  return revealed ? 'opened' : 'sealed';
};
