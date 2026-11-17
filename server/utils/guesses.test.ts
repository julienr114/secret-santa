import { describe, expect, it } from 'vitest';
import {
  autoRevealAt,
  changeGuessMode,
  autoRevealDue,
  correctedGuesses,
  countedGuesses,
  guessChoices,
  guessesOpen,
  keepSantaGuesses,
  moveGuessEnd,
  palmares,
  placeGuess,
  ranking,
  type Guess,
} from './guesses';

// The draw: a → b → c → d → e → f → a.
const PEOPLE = ['a', 'b', 'c', 'd', 'e', 'f'];
const PAIRS = PEOPLE.map((giverId, i) => ({
  giverId,
  receiverId: PEOPLE[(i + 1) % PEOPLE.length]!,
}));
/** `guesser` thinks `giver` gives to `recipient`. */
const g = (guesserId: string, recipientId: string, giverId: string): Guess => ({
  guesserId,
  recipientId,
  giverId,
});

describe('guessesOpen and the reveal', () => {
  const edition = {
    guessMode: 'all' as const,
    status: 'drawn',
    revealedAt: null,
    guessEndsAt: '2026-12-25T17:00:00.000Z',
  };
  it('opens after the draw, until the end time or the reveal', () => {
    expect(guessesOpen(edition, '2026-12-25T16:59:00.000Z')).toBe(true);
    expect(guessesOpen(edition, '2026-12-25T17:00:00.000Z')).toBe(false);
    expect(
      guessesOpen(
        { ...edition, revealedAt: '2026-12-25T10:00:00.000Z' },
        '2026-12-25T11:00:00.000Z',
      ),
    ).toBe(false);
    expect(
      guessesOpen({ ...edition, status: 'preparing' }, '2026-12-01T00:00Z'),
    ).toBe(false);
    expect(
      guessesOpen({ ...edition, guessMode: 'none' }, '2026-12-01T00:00Z'),
    ).toBe(false);
  });

  it('reveals by itself the day after, at the end time', () => {
    expect(autoRevealAt(edition.guessEndsAt)).toBe('2026-12-26T17:00:00.000Z');
    expect(autoRevealDue(edition, '2026-12-26T16:59:00.000Z')).toBe(false);
    expect(autoRevealDue(edition, '2026-12-26T17:00:00.000Z')).toBe(true);
    expect(
      autoRevealDue(
        { ...edition, revealedAt: '2026-12-25T20:00:00.000Z' },
        '2026-12-27T00:00:00.000Z',
      ),
    ).toBe(false);
  });

  it('moves the end with the party, at the same time of day', () => {
    expect(
      moveGuessEnd('2026-12-25T17:00:00.000Z', '2026-12-25', '2026-12-24'),
    ).toBe('2026-12-24T17:00:00.000Z');
    expect(
      moveGuessEnd('2025-12-24T19:30:00.000Z', '2025-12-24', '2026-12-25'),
    ).toBe('2026-12-25T19:30:00.000Z');
  });
});

describe('guessChoices and placeGuess', () => {
  it('offers everyone but the player and the recipient', () => {
    expect(
      guessChoices({
        mode: 'all',
        playerId: 'a',
        recipientId: 'c',
        participantIds: PEOPLE,
      }),
    ).toEqual({ ok: true, value: ['b', 'd', 'e', 'f'] });
  });

  it('asks only for one’s own Santa in « Qui m’offre ? »', () => {
    const ask = (recipientId: string) =>
      guessChoices({
        mode: 'santa',
        playerId: 'a',
        recipientId,
        participantIds: PEOPLE,
      });
    expect(ask('a').ok).toBe(true);
    expect(ask('c')).toMatchObject({ ok: false, reason: 'invalid_guess' });
  });

  it('moves a guess when its person is already named for someone else', () => {
    const mine = [g('a', 'a', 'f'), g('a', 'c', 'b')];
    // Naming f for d moves it away from a.
    expect(placeGuess(mine, g('a', 'd', 'f'))).toEqual([
      g('a', 'c', 'b'),
      g('a', 'd', 'f'),
    ]);
    // A new guess for c replaces the old one.
    expect(placeGuess(mine, g('a', 'c', 'e'))).toEqual([
      g('a', 'a', 'f'),
      g('a', 'c', 'e'),
    ]);
  });

  it('keeps only the guesses on one’s own Santa', () => {
    expect(
      keepSantaGuesses([g('a', 'a', 'f'), g('a', 'c', 'b'), g('b', 'b', 'a')]),
    ).toEqual([g('a', 'a', 'f'), g('b', 'b', 'a')]);
  });
});

describe('countedGuesses', () => {
  it('never counts the line of the person one gives to (the decoy)', () => {
    // a gives to b: a's guess about b is a decoy.
    const guesses = [g('a', 'b', 'c'), g('a', 'c', 'b'), g('a', 'a', 'f')];
    expect(countedGuesses(guesses, PAIRS, 'all')).toEqual([
      g('a', 'c', 'b'),
      g('a', 'a', 'f'),
    ]);
  });

  it('counts only one’s own Santa in « Qui m’offre ? »', () => {
    expect(
      countedGuesses([g('a', 'c', 'b'), g('a', 'a', 'f')], PAIRS, 'santa'),
    ).toEqual([g('a', 'a', 'f')]);
  });

  it('drops guesses about people out of the draw', () => {
    expect(countedGuesses([g('a', 'z', 'b')], PAIRS, 'all')).toEqual([]);
  });
});

describe('palmares', () => {
  it('has no award with fewer than three players', () => {
    const result = palmares([g('a', 'a', 'f'), g('b', 'b', 'a')], PAIRS, 'all');
    expect(result).toEqual({
      players: 2,
      guesses: 2,
      enough: false,
      awards: [],
    });
  });

  it('gives each award, with ties up to three names', () => {
    const guesses = [
      // a: right on own Santa (f), right on c (b), wrong on d (b → moved).
      g('a', 'a', 'f'),
      g('a', 'c', 'b'),
      g('a', 'e', 'b'),
      // b: right on own Santa (a), wrong on d (e).
      g('b', 'b', 'a'),
      g('b', 'd', 'e'),
      // c: wrong on own Santa (e), right on f (e).
      g('c', 'c', 'e'),
      g('c', 'f', 'e'),
    ];
    const result = palmares(guesses, PAIRS, 'all');
    expect(result.players).toBe(3);
    expect(result.enough).toBe(true);
    const byKind = Object.fromEntries(result.awards.map((x) => [x.kind, x]));
    expect(byKind.unmasked).toMatchObject({ winners: ['a', 'b'], count: 2 });
    // a: 2 right out of 3 made.
    expect(byKind.detective).toMatchObject({
      winners: ['a'],
      value: 2,
      total: 3,
    });
    // f, a, b and e were each unmasked once: four, a sentence.
    expect(byKind.transparent).toMatchObject({ winners: [], count: 4 });
    // Nobody unmasked c nor d.
    expect(byKind.hidden).toMatchObject({ winners: ['c', 'd'], count: 2 });
    // e was named wrongly twice.
    expect(byKind.suspect).toMatchObject({ winners: ['e'], value: 2 });
  });

  it('keeps three awards in « Qui m’offre ? », without a ranking', () => {
    const guesses = [g('a', 'a', 'f'), g('b', 'b', 'c'), g('c', 'c', 'b')];
    const kinds = palmares(guesses, PAIRS, 'santa').awards.map((x) => x.kind);
    expect(kinds).not.toContain('detective');
    expect(kinds).not.toContain('transparent');
    expect(kinds).toEqual(['unmasked', 'hidden', 'suspect']);
  });

  it('leaves out an award nobody wins', () => {
    const guesses = [g('a', 'a', 'b'), g('b', 'b', 'c'), g('c', 'c', 'd')];
    const kinds = palmares(guesses, PAIRS, 'all').awards.map((x) => x.kind);
    expect(kinds).toEqual(['hidden', 'suspect']);
  });
});

describe('ranking and correctedGuesses', () => {
  it('ranks by right guesses, then by fewer made', () => {
    const guesses = [
      g('a', 'a', 'f'),
      g('a', 'd', 'b'),
      g('b', 'b', 'a'),
      g('c', 'c', 'e'),
    ];
    expect(
      ranking(countedGuesses(guesses, PAIRS, 'all'), PAIRS).map(
        (s) => s.playerId,
      ),
    ).toEqual(['b', 'a', 'c']);
  });

  it('corrects one player’s guesses, their own Santa first, no decoy', () => {
    const guesses = [g('a', 'c', 'e'), g('a', 'b', 'c'), g('a', 'a', 'f')];
    expect(correctedGuesses('a', guesses, PAIRS, 'all')).toEqual([
      { recipientId: 'a', guessedId: 'f', actualId: 'f', right: true },
      { recipientId: 'c', guessedId: 'e', actualId: 'b', right: false },
    ]);
  });
});

describe('changeGuessMode', () => {
  const guesses = [g('a', 'a', 'f'), g('a', 'c', 'b'), g('b', 'b', 'a')];
  it('keeps everything towards « Toutes les paires »', () => {
    expect(changeGuessMode('all', guesses)).toEqual({ kept: guesses, lost: 0 });
  });

  it('keeps one’s own Santa towards « Qui m’offre ? »', () => {
    expect(changeGuessMode('santa', guesses)).toEqual({
      kept: [g('a', 'a', 'f'), g('b', 'b', 'a')],
      lost: 1,
    });
  });

  it('deletes everything when the game is turned off', () => {
    expect(changeGuessMode('none', guesses)).toEqual({ kept: [], lost: 3 });
  });
});
