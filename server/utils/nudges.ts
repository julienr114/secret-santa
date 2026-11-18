import { instantOf } from '#shared/utils/dates';
import type { Assignment } from './draw';
import type { Guess, GuessMode } from './guesses';

// « Devine qui » : donner envie de jouer, et rappeler (README 22.17,
// Correction 15). Who plays, who passes their turn, who is left to
// remind, when the reminders go. Pure; the routes and the scheduled task
// do the I/O. Never who guessed what.

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** A participant, as the reminders see them. */
export type GameMember = {
  id: string;
  email: string | null;
  /** Made at least one guess. */
  played: boolean;
  /** Guessed only their own Santa (« Toutes les paires »). */
  ownOnly: boolean;
  /** Passed their turn (« Je passe mon tour »). */
  skipped: boolean;
};

/**
 * « 4 sur 6 ont joué » : among those who did not pass their turn.
 * @param members - The participants.
 * @returns How many played, out of how many.
 */
export const playedCount = (
  members: GameMember[],
): { played: number; total: number } => {
  const playing = members.filter((m) => !m.skipped);
  return {
    played: playing.filter((m) => m.played).length,
    total: playing.length,
  };
};

/** The count is shown once two people at least have played. */
export const COUNT_FROM = 2;

/**
 * Those left to remind: not played, not passed their turn.
 * @param members - The participants.
 * @returns Them.
 */
export const toRemind = <M extends GameMember>(members: M[]): M[] =>
  members.filter((m) => !m.played && !m.skipped);

/**
 * Whether one may pass their turn: the guesses open, and not played yet
 * (a player takes their guesses back first).
 * @param p - Open, and whether they played.
 * @returns True when « Je passe mon tour » is offered.
 */
export const canSkip = (p: { open: boolean; played: boolean }): boolean =>
  p.open && !p.played;

/** The day of an instant in a time zone (ISO day). */
const dayIn = (instant: string, timeZone: string): string =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(instant));

/** Days from one ISO day to another. */
const daysBetween = (from: string, to: string): number =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS,
  );

/** The deadline, as the tile and the cards say it. */
export type Deadline = { kind: 'days'; days: number } | { kind: 'lastDay' };

/** The deadline is told in the last seven days. */
export const DEADLINE_DAYS = 7;

/**
 * « Plus que 3 jours », « Dernier jour » : in the last seven days of the
 * guesses, by calendar day in the reader's time zone.
 * @param endsAt - The end of the guesses (ISO instant).
 * @param now - The time now (ISO).
 * @param timeZone - The reader's time zone.
 * @returns The deadline, or null when it is further or past.
 */
export const deadlineOf = (
  endsAt: string | null,
  now: string,
  timeZone: string,
): Deadline | null => {
  if (!endsAt || now >= endsAt) return null;
  const days = daysBetween(dayIn(now, timeZone), dayIn(endsAt, timeZone));
  if (days === 0) return { kind: 'lastDay' };
  return days <= DEADLINE_DAYS ? { kind: 'days', days } : null;
};

/**
 * Days left before the end, by calendar day in a time zone.
 * @param endsAt - The end (ISO instant).
 * @param now - Now (ISO).
 * @param timeZone - The zone.
 * @returns The days.
 */
export const daysLeft = (endsAt: string, now: string, timeZone: string) =>
  daysBetween(dayIn(now, timeZone), dayIn(endsAt, timeZone));

/**
 * When the automatic reminder goes (README 22.17): two days before the
 * end, at 10:00 in the time zone of the setting.
 * @param endsAt - The end of the guesses (ISO instant).
 * @param timeZone - The zone of the setting.
 * @returns The instant (ISO).
 */
export const autoReminderAt = (endsAt: string, timeZone: string): string => {
  const endDay = dayIn(endsAt, timeZone);
  const day = new Date(Date.parse(`${endDay}T00:00:00Z`) - 2 * DAY_MS)
    .toISOString()
    .slice(0, 10);
  return instantOf(day, '10:00', timeZone);
};

/** The game, as the reminders need it. */
export type GameReminderState = {
  guessMode: GuessMode;
  status: string;
  revealedAt: string | null;
  guessEndsAt: string | null;
  /** The automatic reminder is on (a setting, on by default). */
  guessAutoReminder: boolean;
  guessAutoReminderSentAt: string | null;
  /** When the game was turned on. */
  guessEnabledAt: string | null;
  /** The organiser's last reminder. */
  guessReminderSentAt: string | null;
};

/** Why the automatic reminder does not go, or that it goes. */
export type AutoReminderDecision =
  'send' | 'wait' | 'done' | 'off' | 'lateGame' | 'recentManual' | 'missed';

/**
 * How late the automatic reminder may still go, when the scheduled task
 * was late or down (Correction 16): six hours after its time.
 */
export const AUTO_REMINDER_GRACE_HOURS = 6;

/**
 * Whether the automatic reminder goes now (README 22.17): once, at its
 * time; not when turned off, nor when the game was turned on less than
 * three days before the end, nor when the organiser reminded in the last
 * two days; up to six hours late if the scheduled task was late or down,
 * never after (`missed`). Every answer but `wait` settles it for good.
 * @param game - The edition's game.
 * @param now - The time now (ISO).
 * @param sendAt - When it is due (`autoReminderAt`).
 * @returns The decision.
 */
export const autoReminderDecision = (
  game: GameReminderState,
  now: string,
  sendAt: string,
): AutoReminderDecision => {
  if (game.guessAutoReminderSentAt) return 'done';
  if (
    game.guessMode === 'none' ||
    game.status !== 'drawn' ||
    game.revealedAt ||
    !game.guessEndsAt ||
    now >= game.guessEndsAt
  ) {
    return 'off';
  }
  if (now < sendAt) return 'wait';
  // The task was late or down: it still goes within six hours, not after.
  if (
    Date.parse(now) - Date.parse(sendAt) >
    AUTO_REMINDER_GRACE_HOURS * HOUR_MS
  ) {
    return 'missed';
  }
  if (!game.guessAutoReminder) return 'off';
  const end = Date.parse(game.guessEndsAt);
  if (
    game.guessEnabledAt &&
    end - Date.parse(game.guessEnabledAt) < 3 * DAY_MS
  ) {
    return 'lateGame';
  }
  if (
    game.guessReminderSentAt &&
    Date.parse(now) - Date.parse(game.guessReminderSentAt) < 2 * DAY_MS
  ) {
    return 'recentManual';
  }
  return 'send';
};

/**
 * Who gets the automatic reminder, and which text: those with an address
 * who did not pass their turn and did not play (`play`); in « Toutes les
 * paires », also those who only guessed their own Santa (`more`).
 * @param members - The participants.
 * @param mode - The game.
 * @returns The recipients and their text.
 */
export const autoReminderTargets = (
  members: GameMember[],
  mode: GuessMode,
): { id: string; text: 'play' | 'more' }[] =>
  members.flatMap((m): { id: string; text: 'play' | 'more' }[] => {
    if (!m.email || m.skipped) return [];
    if (!m.played) return [{ id: m.id, text: 'play' as const }];
    return mode === 'all' && m.ownOnly
      ? [{ id: m.id, text: 'more' as const }]
      : [];
  });

/** The organiser's update and the suggested reminder: five days before. */
export const NUDGE_DAYS = 5;

/**
 * Whether the organiser's point goes now, and the suggestion on the
 * follow-up shows: in the last five days of open guesses, while someone
 * is left to remind.
 * @param endsAt - The end of the guesses (ISO), or null.
 * @param now - The time now (ISO).
 * @param left - How many are left to remind.
 * @returns True in that window.
 */
export const nudgeTime = (
  endsAt: string | null,
  now: string,
  left: number,
): boolean =>
  Boolean(endsAt) &&
  left > 0 &&
  now < endsAt! &&
  Date.parse(endsAt!) - Date.parse(now) <= NUDGE_DAYS * DAY_MS;

/**
 * The challenge of last year (README 22.17, DevineUniquePrix): how many
 * guessed their own Santa, out of those who tried. Only that figure.
 * @param counted - Last year's guesses that count.
 * @param pairs - Last year's draw.
 * @returns The figure, or null when nobody tried.
 */
export const challengeOf = (
  counted: Guess[],
  pairs: Assignment[],
): { found: number; total: number } | null => {
  const giverOf = new Map(pairs.map((p) => [p.receiverId, p.giverId]));
  const own = counted.filter((g) => g.recipientId === g.guesserId);
  return own.length === 0
    ? null
    : {
        found: own.filter((g) => giverOf.get(g.recipientId) === g.giverId)
          .length,
        total: own.length,
      };
};
