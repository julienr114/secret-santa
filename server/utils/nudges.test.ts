import { describe, expect, it } from 'vitest';
import {
  autoReminderAt,
  autoReminderDecision,
  autoReminderTargets,
  canSkip,
  challengeOf,
  deadlineOf,
  nudgeTime,
  playedCount,
  toRemind,
  type GameMember,
  type GameReminderState,
} from './nudges';

const member = (id: string, over: Partial<GameMember> = {}): GameMember => ({
  id,
  email: `${id}@example.com`,
  played: false,
  ownOnly: false,
  skipped: false,
  ...over,
});
const MEMBERS = [
  member('a', { played: true }),
  member('b', { played: true, ownOnly: true }),
  member('c'),
  member('d', { skipped: true }),
  member('e', { email: null }),
];
const PARIS = 'Europe/Paris';
// The guesses end on 25 December at 18:00 in Paris.
const END = '2026-12-25T17:00:00.000Z';

describe('who plays, who is left', () => {
  it('counts the players among those who did not pass their turn', () => {
    expect(playedCount(MEMBERS)).toEqual({ played: 2, total: 4 });
  });

  it('leaves out those who played or passed their turn', () => {
    expect(toRemind(MEMBERS).map((m) => m.id)).toEqual(['c', 'e']);
  });

  it('lets one pass their turn only before playing, while open', () => {
    expect(canSkip({ open: true, played: false })).toBe(true);
    expect(canSkip({ open: true, played: true })).toBe(false);
    expect(canSkip({ open: false, played: false })).toBe(false);
  });
});

describe('deadlineOf', () => {
  it('counts the days in the last week, then « Dernier jour »', () => {
    expect(deadlineOf(END, '2026-12-22T09:00:00.000Z', PARIS)).toEqual({
      kind: 'days',
      days: 3,
    });
    expect(deadlineOf(END, '2026-12-25T08:00:00.000Z', PARIS)).toEqual({
      kind: 'lastDay',
    });
  });

  it('says nothing further than seven days, nor once it ended', () => {
    expect(deadlineOf(END, '2026-12-10T09:00:00.000Z', PARIS)).toBeNull();
    expect(deadlineOf(END, '2026-12-25T18:00:00.000Z', PARIS)).toBeNull();
    expect(deadlineOf(null, '2026-12-24T09:00:00.000Z', PARIS)).toBeNull();
  });
});

describe('the automatic reminder', () => {
  const game: GameReminderState = {
    guessMode: 'all',
    status: 'drawn',
    revealedAt: null,
    guessEndsAt: END,
    guessAutoReminder: true,
    guessAutoReminderSentAt: null,
    guessEnabledAt: '2026-12-01T10:00:00.000Z',
    guessReminderSentAt: null,
  };
  const at = autoReminderAt(END, PARIS);
  it('goes two days before the end, at 10:00 in the zone of the setting', () => {
    expect(at).toBe('2026-12-23T09:00:00.000Z');
  });

  it('waits, then goes once', () => {
    expect(autoReminderDecision(game, '2026-12-23T08:00:00.000Z', at)).toBe(
      'wait',
    );
    expect(autoReminderDecision(game, '2026-12-23T09:15:00.000Z', at)).toBe(
      'send',
    );
    expect(
      autoReminderDecision(
        { ...game, guessAutoReminderSentAt: at },
        '2026-12-23T09:30:00.000Z',
        at,
      ),
    ).toBe('done');
  });

  it('still goes up to six hours late, not after', () => {
    expect(autoReminderDecision(game, '2026-12-23T14:30:00.000Z', at)).toBe(
      'send',
    );
    expect(autoReminderDecision(game, '2026-12-23T15:30:00.000Z', at)).toBe(
      'missed',
    );
  });

  it('does not go when off, too late, or right after the organiser', () => {
    const now = '2026-12-23T09:15:00.000Z';
    expect(
      autoReminderDecision({ ...game, guessAutoReminder: false }, now, at),
    ).toBe('off');
    expect(
      autoReminderDecision(
        { ...game, guessEnabledAt: '2026-12-23T08:00:00.000Z' },
        now,
        at,
      ),
    ).toBe('lateGame');
    expect(
      autoReminderDecision(
        { ...game, guessReminderSentAt: '2026-12-22T09:00:00.000Z' },
        now,
        at,
      ),
    ).toBe('recentManual');
  });

  it('reaches those who did not play, and in all pairs those with one guess', () => {
    expect(autoReminderTargets(MEMBERS, 'all')).toEqual([
      { id: 'b', text: 'more' },
      { id: 'c', text: 'play' },
    ]);
    expect(autoReminderTargets(MEMBERS, 'santa')).toEqual([
      { id: 'c', text: 'play' },
    ]);
  });
});

describe('nudgeTime', () => {
  it('is the last five days, while someone is left to remind', () => {
    expect(nudgeTime(END, '2026-12-20T18:00:00.000Z', 2)).toBe(true);
    expect(nudgeTime(END, '2026-12-19T09:00:00.000Z', 2)).toBe(false);
    expect(nudgeTime(END, '2026-12-21T09:00:00.000Z', 0)).toBe(false);
  });
});

describe('challengeOf', () => {
  it('gives last year’s found, out of those who tried', () => {
    const pairs = [
      { giverId: 'a', receiverId: 'b' },
      { giverId: 'b', receiverId: 'a' },
    ];
    const g = (guesserId: string, recipientId: string, giverId: string) => ({
      guesserId,
      recipientId,
      giverId,
    });
    expect(challengeOf([g('a', 'a', 'b'), g('b', 'b', 'b')], pairs)).toEqual({
      found: 1,
      total: 2,
    });
    expect(challengeOf([g('a', 'b', 'a')], pairs)).toBeNull();
  });
});
