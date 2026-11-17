import { z } from 'zod';
import { ok, fail, type Result } from './result';
import { isIsoDay, rulesOverrideSchema, rulesPatchSchema } from './rules';
import { byName } from './people';

// Editions of a group (README 4.1). Pure helpers; the routes do the I/O.

// preparing ──► drawn ──► closed, and a cancelled draw goes back to
// preparing (README 4.1, simplified on 15 November 2026: one step before
// the draw instead of draft then invitations).
export const EDITION_STATUSES = ['preparing', 'drawn', 'closed'] as const;
export type EditionStatus = (typeof EDITION_STATUSES)[number];

/** The day of the party: a real date, required since 15 November 2026. */
export const eventDateSchema = z.iso.date();

/**
 * A new edition. The budget and the word for the participants, when given,
 * are its own rules from the start (decided on 17 November 2026), so the
 * journal does not say the rules changed right after it was created.
 */
export const editionInputSchema = z.object({
  label: z.string().trim().min(1).max(60),
  year: z.number().int().min(2000).max(2100),
  eventDate: eventDateSchema,
  budget: rulesPatchSchema.shape.budget,
  guardianMessage: rulesPatchSchema.shape.guardianMessage,
});

export const editionPatchSchema = z
  .object({
    label: z.string().trim().min(1).max(60),
    rulesOverride: rulesOverrideSchema,
    eventDate: eventDateSchema,
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to update');

export type EditionLike = { year: number; status: string; createdAt: string };

/** Sensible defaults for the "new edition" form. */
export const nextEditionDefaults = (editions: EditionLike[], now: string) => {
  const thisYear = new Date(now).getUTCFullYear();
  const latest = Math.max(thisYear - 1, ...editions.map((e) => e.year));
  const year = editions.some((e) => e.year === thisYear)
    ? latest + 1
    : thisYear;
  return { label: `Noël ${year}`, year };
};

const newestFirst = <E extends EditionLike>(a: E, b: E) =>
  b.year - a.year || b.createdAt.localeCompare(a.createdAt);

/** The edition the guardian is working on: the most recent one not closed. */
export const currentEdition = <E extends EditionLike>(
  editions: E[],
): E | null =>
  editions.filter((e) => e.status !== 'closed').toSorted(newestFirst)[0] ??
  null;

/** The edition whose participants a new one starts from. */
export const previousEdition = <E extends EditionLike>(
  editions: E[],
  year: number,
): E | null =>
  editions
    .filter((e) => e.year < year || (e.year === year && e.status === 'closed'))
    .toSorted(newestFirst)[0] ?? null;

export type ParticipantStatus = {
  messageSentAt?: string | null;
  viewCount: number;
  hasHints: boolean;
};

export const BADGES = ['sent', 'hints', 'viewed'] as const;
export type Badge = (typeof BADGES)[number];

/** Status badges for a participant card (README section 11). */
export const participantBadges = ({
  messageSentAt,
  viewCount,
  hasHints,
}: ParticipantStatus): Badge[] =>
  [
    messageSentAt ? 'sent' : null,
    hasHints ? 'hints' : null,
    viewCount > 0 ? 'viewed' : null,
  ].filter((b): b is Badge => b !== null);

// --- Lifecycle (README 4.1) ---------------------------------------------

export const EDITION_ACTIONS = ['draw', 'cancel_draw', 'close'] as const;
export type EditionAction = (typeof EDITION_ACTIONS)[number];

const TRANSITIONS: Record<
  EditionAction,
  { from: EditionStatus; to: EditionStatus }
> = {
  draw: { from: 'preparing', to: 'drawn' },
  cancel_draw: { from: 'drawn', to: 'preparing' },
  close: { from: 'drawn', to: 'closed' },
};

/** The status an action leads to, or why it is not allowed now. */
export const nextStatus = (
  status: EditionStatus,
  action: EditionAction,
): Result<EditionStatus> => {
  const transition = TRANSITIONS[action];
  return transition.from === status
    ? ok(transition.to)
    : fail('invalid_transition', { status, action, expected: transition.from });
};

/** The participant list can change until the draw (README 4.1). */
export const canEditParticipants = (status: EditionStatus): boolean =>
  status === 'preparing';

/** Links can be sent from the creation of the edition until it is closed. */
export const canSendLinks = (status: EditionStatus): boolean =>
  status !== 'closed';

// --- History for the "previous years" exclusion (README 6.1) ------------

export type PastEdition = {
  id: string;
  year: number;
  status: string;
  createdAt: string;
};
export type PastAssignment = {
  editionId: string;
  giverId: string;
  receiverId: string;
};

/** The N most recent drawn or closed editions, other than the current one. */
export const historyEditions = <E extends PastEdition>(
  editions: E[],
  currentId: string,
  years: number,
): E[] =>
  editions
    .filter(
      (e) =>
        e.id !== currentId && (e.status === 'drawn' || e.status === 'closed'),
    )
    .toSorted(
      (a, b) => b.year - a.year || b.createdAt.localeCompare(a.createdAt),
    )
    .slice(0, Math.max(0, years));

/**
 * giverId -> receivers they had in the given editions. A giver absent from
 * an edition has no assignment there, so that year adds no exclusion.
 */
export const buildHistory = (
  assignments: PastAssignment[],
  editionIds: string[],
): Record<string, string[]> =>
  assignments
    .filter((a) => editionIds.includes(a.editionId))
    .reduce<Record<string, string[]>>(
      (acc, a) => ({
        ...acc,
        [a.giverId]: [...new Set([...(acc[a.giverId] ?? []), a.receiverId])],
      }),
      {},
    );

// --- Waived history pairs ------------------------------------------------

export type Waiver = { giverId: string; receiverId: string };

export const waiverSchema = z.object({
  giverId: z.string().min(1),
  receiverId: z.string().min(1),
});

/** Reads the stored waivers of an edition, ignoring anything malformed. */
export const parseWaivers = (stored: unknown): Waiver[] =>
  Array.isArray(stored)
    ? stored.flatMap((w) => {
        const parsed = waiverSchema.safeParse(w);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

/** Adds a waiver once (same pair twice is a no-op). */
export const addWaiver = (waivers: Waiver[], waiver: Waiver): Waiver[] =>
  waivers.some(
    (w) => w.giverId === waiver.giverId && w.receiverId === waiver.receiverId,
  )
    ? waivers
    : [...waivers, waiver];

/**
 * History without the pairs the guardian waived for this edition: those
 * past receivers become possible again.
 */
export const applyWaivers = (
  history: Record<string, string[]>,
  waivers: Waiver[],
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(history).map(([giver, receivers]) => [
      giver,
      receivers.filter(
        (r) => !waivers.some((w) => w.giverId === giver && w.receiverId === r),
      ),
    ]),
  );

// --- Size of an edition ---------------------------------------------------

/**
 * Most participants an edition can have. D1 caps a statement at 100 bound
 * parameters and some queries list every participation of an edition, so
 * the limit is enforced here rather than met as a database error.
 */
export const MAX_PARTICIPANTS = 100;

/** Whether an edition that would have `count` participants is allowed. */
export const checkParticipantCount = (count: number): Result<number> =>
  count > MAX_PARTICIPANTS
    ? fail('too_many_participants', { max: MAX_PARTICIPANTS, count })
    : ok(count);

// --- The edition screen (README 11, redesign of 15 November 2026) --------

/** The steps of the edition screen, in order. */
export const EDITION_STEPS = ['prepare', 'drawn', 'party'] as const;
export type EditionStep = (typeof EDITION_STEPS)[number];

/**
 * Which step of the edition screen is current: preparing until the draw,
 * then following the draw until the day of the party, then the party.
 * @param status - Status of the edition.
 * @param eventDate - Day of the party (ISO), or anything else when unknown.
 * @param today - ISO day.
 * @returns The current step.
 */
export const editionStep = (
  status: EditionStatus,
  eventDate: string | null | undefined,
  today: string,
): EditionStep => {
  if (status === 'preparing') return 'prepare';
  if (status === 'closed') return 'party';
  const isDay = typeof eventDate === 'string' && ISO_DAY.test(eventDate);
  return isDay && today >= eventDate ? 'party' : 'drawn';
};
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** How a step of the stepper reads, and where it stands. */
export type EditionStepView = {
  /** The words of the step: « Préparer », « Tirage fait », « Fêté »… */
  label: 'prepare' | 'draw' | 'drawDone' | 'party' | 'partyDone';
  state: 'done' | 'current' | 'todo';
};

/**
 * The three steps of an edition as the stepper shows them: done before
 * the current one, all done once closed or revealed; the draw reads
 * « Tirage fait » once drawn, the party « Fêté » once closed or revealed.
 * @param status - Status of the edition.
 * @param eventDate - Day of the party (ISO), or anything else when unknown.
 * @param today - ISO day.
 * @param revealed - Whether the results were revealed.
 * @returns The steps, in order.
 */
export const editionSteps = (
  status: EditionStatus,
  eventDate: string | null | undefined,
  today: string,
  revealed = false,
): EditionStepView[] => {
  const at = EDITION_STEPS.indexOf(editionStep(status, eventDate, today));
  const closed = status === 'closed' || revealed;
  const labels = [
    'prepare',
    status === 'preparing' ? 'draw' : 'drawDone',
    closed ? 'partyDone' : 'party',
  ] as const;
  return labels.map((label, index) => ({
    label,
    state: closed || index < at ? 'done' : index === at ? 'current' : 'todo',
  }));
};

/** What the follow-up of a participant needs. */
export type FollowedParticipant = {
  firstName: string;
  lastName?: string | null;
  messageSentAt?: string | null;
  viewCount: number;
};

/** Where a participant stands after the draw, from the least done. */
export const FOLLOW_STATES = ['toNotify', 'notOpened', 'viewed'] as const;
export type FollowState = (typeof FOLLOW_STATES)[number];

/**
 * Where a participant stands: discovered their result, sent their link
 * but not opened yet, or still to notify. Having looked wins over
 * everything: a link may have been passed on by hand.
 * @param participant - Their sending and viewing.
 * @returns The state.
 */
export const followState = (participant: FollowedParticipant): FollowState => {
  if (participant.viewCount > 0) return 'viewed';
  return participant.messageSentAt ? 'notOpened' : 'toNotify';
};

/**
 * Whether the email screen ticks this participant at first: someone with
 * an address who has not been sent anything yet.
 * @param participant - A participant, with their address.
 * @returns True when they start ticked.
 */
export const preselectedForEmail = (
  participant: FollowedParticipant & { email: string | null },
): boolean =>
  Boolean(participant.email) && followState(participant) === 'toNotify';

/**
 * How many participants are in each state.
 * @param participants - The participants of the edition.
 * @returns The three counts.
 */
export const participantCounters = (
  participants: readonly FollowedParticipant[],
): Record<FollowState, number> =>
  participants.reduce(
    (counts, participant) => {
      const state = followState(participant);
      return { ...counts, [state]: counts[state] + 1 };
    },
    { toNotify: 0, notOpened: 0, viewed: 0 },
  );

/**
 * The participants in the order of the list: by first name while
 * preparing; after the draw, those to notify first, then those who have
 * not opened, then those who have looked, by first name in each.
 * @param participants - The participants.
 * @param status - Status of the edition.
 * @returns A new, sorted list.
 */
export const sortParticipants = <P extends FollowedParticipant>(
  participants: readonly P[],
  status: EditionStatus,
): P[] =>
  status === 'preparing'
    ? participants.toSorted(byName)
    : participants.toSorted(
        (a, b) =>
          FOLLOW_STATES.indexOf(followState(a)) -
            FOLLOW_STATES.indexOf(followState(b)) || byName(a, b),
      );

/** The participants who stand at the same place after the draw. */
export type FollowSeries<P> = { state: FollowState; items: P[] };

/**
 * The list after the draw, cut into its series: to notify, not opened,
 * looked. Each keeps the order of the list; an empty series is left out.
 * @param participants - The participants.
 * @returns The series, from the least done.
 */
export const followSeries = <P extends FollowedParticipant>(
  participants: readonly P[],
): FollowSeries<P>[] => {
  const sorted = sortParticipants(participants, 'drawn');
  return FOLLOW_STATES.map((state) => ({
    state,
    items: sorted.filter((p) => followState(p) === state),
  })).filter((series) => series.items.length > 0);
};

// --- Revealing the results (README 22.9, lot 13) --------------------------

/** What deciding whether the results may be revealed needs of an edition. */
export type RevealableEdition = {
  status: EditionStatus;
  revealedAt: string | null;
};

/**
 * Whether the organiser may reveal who gave to whom: a drawn edition, not
 * revealed yet, whose party has a date. From the day of the party; before
 * it, only when they say so (`early`), after a stern warning.
 * @param edition - The edition.
 * @param eventDate - Day of the party.
 * @param today - ISO day.
 * @param early - The organiser chose to reveal before the party.
 * @returns Ok, with whether it is before the party; or why not.
 */
export const canRevealDraw = (
  edition: RevealableEdition,
  eventDate: string | null | undefined,
  today: string,
  early: boolean,
): Result<{ early: boolean }> => {
  if (edition.status !== 'drawn') return fail('invalid_transition');
  if (edition.revealedAt) return fail('results_already_revealed');
  if (!isIsoDay(eventDate)) return fail('party_date_missing');
  const before = today < eventDate;
  if (before && !early) return fail('party_not_reached');
  return ok({ early: before });
};

// --- Participations reset by the lifecycle ---------------------------------

/**
 * What cancelling a draw resets on every participation (README 6.5): the
 * counts of views, and the announcement of hints, so that the next giver
 * is told once too (lot 16 bis).
 */
export const CANCELLED_PARTICIPATION = Object.freeze({
  viewCount: 0,
  firstViewedAt: null,
  lastViewedAt: null,
  hintsAnnouncedAt: null,
});

/**
 * What a draw resets on every participation: the « envoyé » badge (one
 * round of messages is enough), and the announcement of hints, for a draw
 * made again.
 */
export const DRAWN_PARTICIPATION = Object.freeze({
  messageSentAt: null,
  hintsAnnouncedAt: null,
});
