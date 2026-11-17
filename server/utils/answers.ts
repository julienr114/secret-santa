import { ok, fail, type Result } from './result';
import { MIN_PARTICIPANTS, type Assignment } from './draw';

// A draw already made elsewhere (README 22.12): on paper or in another
// app. Each participant says on their page who they give to; when the
// answers fit together, the organiser validates and they become an
// ordinary draw. Pure functions; the routes do the I/O and never send an
// answer to the organiser.

export const DRAW_MODES = ['app', 'elsewhere'] as const;
/** How the edition is drawn: by the app, or already elsewhere. */
export type DrawMode = (typeof DRAW_MODES)[number];

/** One participant's answer: who gives (them) to whom, by person. */
export type Answer = Assignment;

/**
 * The answers that still hold: given by a participant, naming another
 * participant. One naming someone taken out of the edition since, or given
 * by them, counts for nothing.
 * @param participantIds - The persons taking part.
 * @param answers - The answers saved.
 * @returns The answers that hold, one per giver.
 */
export const validAnswers = (
  participantIds: string[],
  answers: Answer[],
): Answer[] => {
  const ids = new Set(participantIds);
  return answers.filter(
    (a, at) =>
      ids.has(a.giverId) &&
      ids.has(a.receiverId) &&
      a.giverId !== a.receiverId &&
      answers.findIndex((b) => b.giverId === a.giverId) === at,
  );
};

export type AnswersState = {
  /** Those who answered, in the order of the participants. */
  answered: string[];
  /** Those who have not answered yet. */
  missing: string[];
  /** Those who named the same person as someone else. */
  conflicts: string[];
  /**
   * The one missing answer, when it follows from the others: a single
   * person left that nobody named, and not the one who has not answered.
   */
  deduced: Answer | null;
  /** Everyone answered and nothing clashes. */
  ready: boolean;
};

/**
 * Where the answers of an edition stand, for the organiser: who answered,
 * who clashes, whether the last one follows from the others. Never what
 * anyone answered.
 * @param participantIds - The persons taking part.
 * @param answers - The answers saved.
 * @returns The state.
 */
export const answersState = (
  participantIds: string[],
  answers: Answer[],
): AnswersState => {
  const held = validAnswers(participantIds, answers);
  const giverOf = new Map(held.map((a) => [a.giverId, a]));
  const answered = participantIds.filter((id) => giverOf.has(id));
  const missing = participantIds.filter((id) => !giverOf.has(id));
  const named = held.map((a) => a.receiverId);
  const conflicts = answered.filter((id) => {
    const receiver = giverOf.get(id)!.receiverId;
    return named.filter((r) => r === receiver).length > 1;
  });
  const unnamed = participantIds.filter((id) => !named.includes(id));
  const last = missing[0];
  const deduced =
    missing.length === 1 &&
    conflicts.length === 0 &&
    unnamed.length === 1 &&
    last !== undefined &&
    unnamed[0] !== last &&
    participantIds.length >= MIN_PARTICIPANTS
      ? { giverId: last, receiverId: unnamed[0]! }
      : null;
  return {
    answered,
    missing,
    conflicts,
    deduced,
    ready:
      missing.length === 0 &&
      conflicts.length === 0 &&
      participantIds.length >= MIN_PARTICIPANTS,
  };
};

/**
 * Whether the organiser may validate: everyone answered and it fits, or
 * only one answer is missing and it follows from the others.
 * @param state - Where the answers stand.
 * @returns True when the edition can be validated.
 */
export const canValidateAnswers = (state: AnswersState): boolean =>
  state.ready || state.deduced !== null;

/**
 * The draw the answers make, ready to be stored like any other: each
 * participant gives once and receives once, never to themselves.
 * @param participantIds - The persons taking part.
 * @param answers - The answers saved.
 * @returns The pairs, or why the answers are not ready.
 */
export const pairsFromAnswers = (
  participantIds: string[],
  answers: Answer[],
): Result<Answer[]> => {
  const state = answersState(participantIds, answers);
  if (!canValidateAnswers(state)) {
    return fail('answers_not_ready', {
      missing: state.missing.length,
      conflicts: state.conflicts.length,
    });
  }
  const held = validAnswers(participantIds, answers);
  return ok(state.deduced ? [...held, state.deduced] : held);
};

export const ANSWER_STATUSES = [
  'toCheck',
  'toNotify',
  'asked',
  'answered',
] as const;
/** Where one participant stands, as the organiser sees it. */
export type AnswerStatus = (typeof ANSWER_STATUSES)[number];

/**
 * Where one participant stands: their answer clashes, nobody asked them
 * yet, asked and not answered, or answered.
 * @param p - Whether they answered, clash, and were sent a message.
 * @returns The status.
 */
export const answerStatusOf = (p: {
  answered: boolean;
  inConflict: boolean;
  messageSentAt: string | null;
}): AnswerStatus => {
  if (p.inConflict) return 'toCheck';
  if (p.answered) return 'answered';
  return p.messageSentAt ? 'asked' : 'toNotify';
};

/**
 * The participants in the order of the list: answers to check first, then
 * those to ask, those asked, those who answered; by name within each.
 * @param people - The participants with their status and a name.
 * @returns A sorted copy.
 */
export const sortByAnswer = <P extends { answerStatus: AnswerStatus }>(
  people: P[],
  nameOf: (p: P) => string,
): P[] =>
  people.toSorted(
    (a, b) =>
      ANSWER_STATUSES.indexOf(a.answerStatus) -
        ANSWER_STATUSES.indexOf(b.answerStatus) ||
      nameOf(a).localeCompare(nameOf(b)),
  );

/** What the organiser's card says now. */
export type AnswersCard = 'collect' | 'conflict' | 'oneMissing' | 'ready';

/**
 * The card of the « Réponses » step: answers clash, everything fits, one
 * answer is left and follows from the others, or answers are still coming.
 * @param state - Where the answers stand.
 * @returns The card.
 */
export const answersCard = (state: AnswersState): AnswersCard => {
  if (state.conflicts.length > 0) return 'conflict';
  if (state.ready) return 'ready';
  if (state.deduced) return 'oneMissing';
  return 'collect';
};

export const ANSWER_ACTIONS = [
  'start',
  'abandon',
  'validate',
  'answer',
  'draw',
] as const;
/** What can be done around the answers, and the ordinary draw. */
export type AnswerAction = (typeof ANSWER_ACTIONS)[number];

/**
 * Whether an action fits the edition now: the mode is chosen, and the
 * answers given, abandoned or validated, only before the draw; the app
 * draws only an edition not waiting for answers.
 * @param edition - Its status and how it is drawn.
 * @param action - The action.
 * @returns Ok, or why not.
 */
export const answersAllow = (
  edition: { status: string; drawMode: DrawMode },
  action: AnswerAction,
): Result<true> => {
  if (edition.status !== 'preparing') {
    return fail('invalid_transition', { status: edition.status, action });
  }
  const collecting = edition.drawMode === 'elsewhere';
  if (action === 'start' || action === 'draw') {
    return collecting ? fail('collecting_answers') : ok(true);
  }
  return collecting ? ok(true) : fail('not_collecting_answers');
};
