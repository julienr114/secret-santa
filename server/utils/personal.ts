import { ok, fail, type Result } from './result';
import type { EditionStatus } from './editions';
import { daysUntil, isIsoDay } from './rules';
import type { Assignment } from './draw';

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

/** Where a step of the participant's timeline stands. */
export type StepState = 'done' | 'current' | 'todo';

/**
 * What a step says beside its name: the draw is soon or done; the party
 * is in some days, today, or over. Null when there is nothing to add.
 */
export type StepNote =
  'soon' | 'done' | 'answer' | 'inDays' | 'today' | 'over' | null;

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
 * @param answering - The draw was made elsewhere and the participant says
 *   who they give to: the draw reads « Ta réponse » (README 22.12).
 * @returns The invitation, the draw and the party, with where each stands.
 */
export const participantSteps = (
  phase: PersonalPhase,
  eventDate: string | null | undefined,
  today: string,
  answering = false,
): ParticipantStep[] => [
  { key: 'invitation', state: 'done', note: null },
  {
    key: 'draw',
    state: phase === 'closed' ? 'done' : 'current',
    note:
      phase === 'waiting' && answering
        ? 'answer'
        : phase === 'waiting'
          ? 'soon'
          : 'done',
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

/** Where the tile « Devine qui » stands (README 22.17). */
export type GameTile =
  'play' | 'played' | 'skipped' | 'waiting' | 'palmares' | 'answers';

/**
 * The tile « Devine qui » on the page of a draw: a guess to make, made,
 * waiting for the party once closed, then the palmarès to watch (in pine),
 * then the answers; no tile once revealed if nobody played.
 * @param game - The game as the page knows it, or null when it is off.
 * @returns Where the tile stands, or null for no tile.
 */
export const gameTile = (
  game: {
    open: boolean;
    played: boolean;
    revealed: boolean;
    palmares: boolean;
    seen: boolean;
    /** Passed their turn (Correction 15). */
    skipped?: boolean;
  } | null,
): GameTile | null => {
  if (!game) return null;
  // Nobody played: nothing of the game after the reveal (Correction 12).
  if (game.revealed) {
    if (!game.palmares) return null;
    return game.seen ? 'answers' : 'palmares';
  }
  if (game.open) {
    if (game.played) return 'played';
    return game.skipped ? 'skipped' : 'play';
  }
  return 'waiting';
};

/** A draw revealed, as a participant reads it (README 22.18). */
export type OpenDraw = {
  /** The person they give to, and the one who gives to them. */
  receiverId: string;
  santaId: string | null;
  /** Every pair, in the order of the givers given. */
  pairs: Assignment[];
};

/**
 * A revealed draw for one participant (README 22.18): once revealed, it is
 * visible to the whole group, so the participant gets who they give to,
 * who gives to them, and every pair; never before (the route refuses).
 * @param pairs - The draw.
 * @param me - The participant's person.
 * @param order - The persons in the order of the list.
 * @returns What they see, or why not.
 */
export const openDraw = (
  pairs: Assignment[],
  me: string,
  order: string[],
): Result<OpenDraw> => {
  const mine = pairs.find((p) => p.giverId === me);
  if (!mine) return fail('result_not_found');
  const rank = new Map(order.map((id, i) => [id, i]));
  return ok({
    receiverId: mine.receiverId,
    santaId: pairs.find((p) => p.receiverId === me)?.giverId ?? null,
    pairs: pairs.toSorted(
      (a, b) =>
        (rank.get(a.giverId) ?? Infinity) - (rank.get(b.giverId) ?? Infinity),
    ),
  });
};

/** Who revealed the draw, as the banner says it (README 22.18). */
export type Revealer = { kind: 'me' } | { kind: 'name'; name: string } | null;

/**
 * Who revealed, for one participant: themselves (« Tu l'as dévoilé »), a
 * person of the group by name, or nobody known (« Ton organisateur »).
 * @param by - The person who revealed, if known.
 * @param me - The participant's person.
 * @param names - The names of the group's persons.
 * @returns Who revealed.
 */
export const revealerFor = (
  by: string | null,
  me: string,
  names: Record<string, string>,
): Revealer => {
  if (!by) return null;
  if (by === me) return { kind: 'me' };
  return names[by] ? { kind: 'name', name: names[by] } : null;
};
