import { ok, fail, type Result } from './result';
import type { Assignment } from './draw';
import { awardsOf, detectiveScores, type Award } from './awards';

// « Devine qui », the game of guesses (README 22.17). After the draw, each
// participant may guess who gives to whom; the answers come at the party,
// when the draw is revealed. Pure functions; the routes do the I/O and
// never send anyone else's guess before the reveal.

export const GUESS_MODES = ['none', 'santa', 'all'] as const;
/** No game, « Qui m'offre ? » (one's own Santa only), « Toutes les paires ». */
export type GuessMode = (typeof GUESS_MODES)[number];

/** One guess: `guesserId` thinks `giverId` gives to `recipientId` (persons). */
export type Guess = {
  guesserId: string;
  recipientId: string;
  giverId: string;
  /** When this answer was given (ISO). */
  at?: string;
  /** The persons named on this line before, oldest first (Correction 14). */
  previous?: string[];
};

/** Fewer players than this: the small palmarès, without awards. */
export const MIN_PLAYERS = 3;
/**
 * Fewer participants than this: no game. At three, the draw is a loop and
 * everyone knows who gives to them (Correction 12).
 */
export const MIN_GAME_PARTICIPANTS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether « Devine qui » makes sense for a draw of this size: four
 * participants at least. Before the draw the setting stays free; the draw
 * turns the game off below that.
 * @param participants - How many take part in the draw.
 * @returns True when there is something to guess.
 */
export const gamePossible = (participants: number): boolean =>
  participants >= MIN_GAME_PARTICIPANTS;

/** The game's settings of an edition without the game. */
export const GAME_OFF = {
  guessMode: 'none',
  guessEndsAt: null,
  guessTimeZone: null,
} as const;

/**
 * When the guesses ended: the end time, or the reveal if it came first.
 * @param edition - Its end time and when the guesses were closed.
 * @returns The instant (ISO), or null.
 */
export const guessesEndedAt = (edition: {
  guessEndsAt: string | null;
  guessesClosedAt: string | null;
}): string | null =>
  [edition.guessEndsAt, edition.guessesClosedAt]
    .filter((x): x is string => Boolean(x))
    .toSorted()[0] ?? null;

/**
 * Whether guesses can be made or changed now: the game is on, the edition
 * drawn and not revealed, and the end time not reached.
 * @param edition - Its mode, status, reveal and end time (ISO instants).
 * @param now - The time now (ISO).
 * @returns True while guesses are open.
 */
export const guessesOpen = (
  edition: {
    guessMode: GuessMode;
    status: string;
    revealedAt: string | null;
    guessEndsAt: string | null;
  },
  now: string,
): boolean =>
  edition.guessMode !== 'none' &&
  edition.status === 'drawn' &&
  !edition.revealedAt &&
  Boolean(edition.guessEndsAt) &&
  now < edition.guessEndsAt!;

/**
 * When the answers come by themselves if the organiser has not revealed:
 * the day after the party, at the end time of the guesses.
 * @param guessEndsAt - The end of the guesses (ISO instant).
 * @returns The instant (ISO).
 */
export const autoRevealAt = (guessEndsAt: string): string =>
  new Date(new Date(guessEndsAt).getTime() + DAY_MS).toISOString();

/**
 * Whether the scheduled task must reveal the draw now: the game is on, the
 * edition drawn, not revealed, and the day after the party has come at
 * the end time.
 * @param edition - Its mode, status, reveal and end time.
 * @param now - The time now (ISO).
 * @returns True when the reveal is due.
 */
export const autoRevealDue = (
  edition: {
    guessMode: GuessMode;
    status: string;
    revealedAt: string | null;
    guessEndsAt: string | null;
  },
  now: string,
): boolean =>
  edition.guessMode !== 'none' &&
  edition.status === 'drawn' &&
  !edition.revealedAt &&
  Boolean(edition.guessEndsAt) &&
  now >= autoRevealAt(edition.guessEndsAt!);

/**
 * The end of the guesses moved with the party: the same time of day, on
 * the new day.
 * @param guessEndsAt - The end (ISO instant).
 * @param from - The old day of the party (ISO day).
 * @param to - The new day of the party (ISO day).
 * @returns The new end (ISO instant).
 */
export const moveGuessEnd = (
  guessEndsAt: string,
  from: string,
  to: string,
): string => {
  const days =
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS;
  return new Date(Date.parse(guessEndsAt) + days * DAY_MS).toISOString();
};

/**
 * The people one may name as the giver of `recipientId`: everyone but the
 * recipient, the player too (« Moi »), except on their own line: nobody
 * gives to themselves (decided by Julien on 18 November 2026). In « Qui
 * m'offre ? », only one's own Santa is asked.
 * @param p - The mode, the player, the recipient and the participants.
 * @returns The persons, or why the question is not asked.
 */
export const guessChoices = (p: {
  mode: GuessMode;
  playerId: string;
  recipientId: string;
  participantIds: string[];
}): Result<string[]> => {
  if (p.mode === 'none') return fail('guesses_off');
  if (!p.participantIds.includes(p.recipientId)) return fail('invalid_guess');
  if (p.mode === 'santa' && p.recipientId !== p.playerId) {
    return fail('invalid_guess');
  }
  return ok(p.participantIds.filter((id) => id !== p.recipientId));
};

/**
 * One player's guesses with a new one: a person names one recipient only,
 * so naming them again moves the guess (« Ton pronostic pour Hugo : le
 * choisir le déplace ici »). The line keeps who it named before (for
 * « La girouette » and « Si près du but »); the same answer again changes
 * nothing, not even its time.
 * @param mine - The player's guesses.
 * @param guess - The new guess, with its time.
 * @returns The player's guesses afterwards.
 */
export const placeGuess = (mine: Guess[], guess: Guess): Guess[] => {
  const old = mine.find((g) => g.recipientId === guess.recipientId);
  if (old?.giverId === guess.giverId) return mine;
  return [
    ...mine.filter(
      (g) => g.recipientId !== guess.recipientId && g.giverId !== guess.giverId,
    ),
    {
      ...guess,
      previous: old ? [...(old.previous ?? []), old.giverId] : [],
    },
  ];
};

/**
 * Going back to « Qui m'offre ? »: only the guesses on one's own Santa stay.
 * @param guesses - Every guess.
 * @returns Those that stay.
 */
export const keepSantaGuesses = (guesses: Guess[]): Guess[] =>
  guesses.filter((g) => g.guesserId === g.recipientId);

/** The receiver of each giver. */
const receiverMap = (pairs: Assignment[]) =>
  new Map(pairs.map((p) => [p.giverId, p.receiverId]));
/** The giver of each receiver. */
const giverMap = (pairs: Assignment[]) =>
  new Map(pairs.map((p) => [p.receiverId, p.giverId]));

/**
 * The guesses that count: about participants of the draw, and in « Qui
 * m'offre ? » only on one's own Santa. The line of the person the player
 * gives to counts too: naming oneself there is a right guess (decided by
 * Julien on 18 November 2026, in place of the decoy that never counted).
 * @param guesses - Every guess.
 * @param pairs - The draw.
 * @param mode - The game.
 * @returns The guesses that count.
 */
export const countedGuesses = (
  guesses: Guess[],
  pairs: Assignment[],
  mode: GuessMode,
): Guess[] => {
  const receiverOf = receiverMap(pairs);
  const giverOf = giverMap(pairs);
  return guesses.filter(
    (g) =>
      receiverOf.has(g.guesserId) &&
      giverOf.has(g.recipientId) &&
      receiverOf.has(g.giverId) &&
      g.giverId !== g.recipientId &&
      (mode === 'all' || g.recipientId === g.guesserId),
  );
};

/**
 * Whether a guess was right.
 * @param guess - The guess.
 * @param pairs - The draw.
 * @returns True when its giver gives to its recipient.
 */
export const isRight = (guess: Guess, pairs: Assignment[]): boolean =>
  receiverMap(pairs).get(guess.giverId) === guess.recipientId;

/** A player's line of the ranking. */
export type Standing = { playerId: string; right: number; made: number };

/**
 * The ranking (« Toutes les paires »): the detective's score first (each
 * right guess worth more when others were wrong), then precision, then
 * who made the fewest.
 * @param counted - The guesses that count.
 * @param pairs - The draw.
 * @returns One line per player.
 */
export const ranking = (counted: Guess[], pairs: Assignment[]): Standing[] =>
  detectiveScores(counted, pairs)
    .toSorted(
      (a, b) =>
        b.score - a.score ||
        b.right / b.made - a.right / a.made ||
        a.made - b.made ||
        a.playerId.localeCompare(b.playerId),
    )
    .map(({ playerId, right, made }) => ({ playerId, right, made }));

/**
 * How much of a palmarès there is (Correction 12): nothing without a
 * player; the small one (the reader's own Santa, no award) with one or two
 * players, or in a draw of three made before the game needed four; the
 * full one otherwise.
 */
export type PalmaresSize = 'none' | 'small' | 'full';

/**
 * The size of a palmarès.
 * @param players - How many made a guess that counts.
 * @param participants - How many took part in the draw.
 * @returns Its size.
 */
export const palmaresSize = (
  players: number,
  participants: number,
): PalmaresSize =>
  players === 0
    ? 'none'
    : players < MIN_PLAYERS || !gamePossible(participants)
      ? 'small'
      : 'full';

/** What the results of a game are, for the images and the answers page. */
export type Palmares = {
  /** People who made at least one guess that counts. */
  players: number;
  guesses: number;
  /** Nothing, the small palmarès, or the full one with its awards. */
  size: PalmaresSize;
  /** In the order of the images; an award whose condition fails is left out. */
  awards: Award[];
};

/**
 * The palmarès of a game (README 22.17, Correction 14): its size, and, for
 * the full one, its award screens (`awardsOf`).
 * @param guesses - Every guess.
 * @param pairs - The draw.
 * @param mode - The game.
 * @param endedAt - When the guesses ended, for « Sur le fil ».
 * @returns The palmarès.
 */
export const palmares = (
  guesses: Guess[],
  pairs: Assignment[],
  mode: GuessMode,
  endedAt: string | null = null,
): Palmares => {
  const counted = countedGuesses(guesses, pairs, mode);
  const players = new Set(counted.map((g) => g.guesserId)).size;
  const size = palmaresSize(players, pairs.length);
  return {
    players,
    guesses: counted.length,
    size,
    awards: size === 'full' ? awardsOf({ counted, pairs, mode, endedAt }) : [],
  };
};

/** One of the player's guesses, corrected. */
export type CorrectedGuess = {
  recipientId: string;
  guessedId: string;
  actualId: string;
  right: boolean;
};

/**
 * A player's own guesses once the draw is revealed, corrected: those that
 * count, their own Santa first.
 * @param playerId - The player.
 * @param guesses - Every guess.
 * @param pairs - The draw.
 * @param mode - The game.
 * @returns The player's guesses with the right answer.
 */
export const correctedGuesses = (
  playerId: string,
  guesses: Guess[],
  pairs: Assignment[],
  mode: GuessMode,
): CorrectedGuess[] => {
  const giverOf = giverMap(pairs);
  return countedGuesses(
    guesses.filter((g) => g.guesserId === playerId),
    pairs,
    mode,
  )
    .map((g) => ({
      recipientId: g.recipientId,
      guessedId: g.giverId,
      actualId: giverOf.get(g.recipientId)!,
      right: isRight(g, pairs),
    }))
    .toSorted(
      (a, b) =>
        Number(b.recipientId === playerId) - Number(a.recipientId === playerId),
    );
};

/**
 * Changing the mode of the game (README 22.17): « Qui m'offre ? » to
 * « Toutes les paires » keeps everything; the other way keeps only the
 * guesses on one's own Santa, after a confirmation; turning the game off
 * deletes every guess.
 * @param to - The new mode.
 * @param guesses - Every guess.
 * @returns The guesses kept, and how many go.
 */
export const changeGuessMode = (
  to: GuessMode,
  guesses: Guess[],
): { kept: Guess[]; lost: number } => {
  const kept =
    to === 'none' ? [] : to === 'santa' ? keepSantaGuesses(guesses) : guesses;
  return { kept, lost: guesses.length - kept.length };
};

/**
 * The game of a new edition, taken from the previous one (README 22.17):
 * the same mode, the end at the same time of day on the new party.
 * @param previous - The previous edition, its game and its party, if any.
 * @param eventDate - The day of the new party.
 * @returns The game's settings of the new edition.
 */
export const carriedGame = (
  previous: {
    guessMode: GuessMode;
    guessEndsAt: string | null;
    guessTimeZone: string | null;
    rules?: unknown;
  } | null,
  eventDate: string,
): {
  guessMode: GuessMode;
  guessEndsAt: string | null;
  guessTimeZone: string | null;
} => {
  const previousDate = (previous?.rules as { eventDate?: unknown } | null)
    ?.eventDate;
  if (
    !previous ||
    previous.guessMode === 'none' ||
    !previous.guessEndsAt ||
    typeof previousDate !== 'string'
  ) {
    return { guessMode: 'none', guessEndsAt: null, guessTimeZone: null };
  }
  return {
    guessMode: previous.guessMode,
    guessEndsAt: moveGuessEnd(previous.guessEndsAt, previousDate, eventDate),
    guessTimeZone: previous.guessTimeZone,
  };
};
