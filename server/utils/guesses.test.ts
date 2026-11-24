import { describe, expect, it } from 'vitest';
import {
  autoRevealAt,
  carriedGame,
  changeGuessMode,
  autoRevealDue,
  correctedGuesses,
  gamePossible,
  countedGuesses,
  guessChoices,
  guessesOpen,
  isRight,
  keepSantaGuesses,
  moveGuessEnd,
  palmares,
  palmaresSize,
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
  it('offers everyone but the recipient, the player too', () => {
    const ask = (recipientId: string) =>
      guessChoices({
        mode: 'all',
        playerId: 'a',
        recipientId,
        participantIds: PEOPLE,
      });
    expect(ask('c')).toEqual({ ok: true, value: ['a', 'b', 'd', 'e', 'f'] });
    // On one's own line, never oneself.
    expect(ask('a')).toEqual({ ok: true, value: ['b', 'c', 'd', 'e', 'f'] });
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
      { ...g('a', 'd', 'f'), previous: [] },
    ]);
    // A new guess for c replaces the old one, which it remembers.
    expect(placeGuess(mine, g('a', 'c', 'e'))).toEqual([
      g('a', 'a', 'f'),
      { ...g('a', 'c', 'e'), previous: ['b'] },
    ]);
  });

  it('remembers every earlier answer, and nothing for the same one', () => {
    const once = placeGuess([g('a', 'c', 'b')], g('a', 'c', 'e'));
    const twice = placeGuess(once, g('a', 'c', 'd'));
    expect(twice[0]?.previous).toEqual(['b', 'e']);
    expect(placeGuess(twice, { ...g('a', 'c', 'd'), at: 'later' })).toBe(twice);
  });

  it('keeps only the guesses on one’s own Santa', () => {
    expect(
      keepSantaGuesses([g('a', 'a', 'f'), g('a', 'c', 'b'), g('b', 'b', 'a')]),
    ).toEqual([g('a', 'a', 'f'), g('b', 'b', 'a')]);
  });
});

describe('countedGuesses', () => {
  it('counts the line of the person one gives to, oneself named there', () => {
    // a gives to b: naming oneself on b's line is a right guess.
    const guesses = [g('a', 'b', 'a'), g('a', 'c', 'b'), g('a', 'a', 'f')];
    expect(countedGuesses(guesses, PAIRS, 'all')).toEqual(guesses);
    expect(isRight(g('a', 'b', 'a'), PAIRS)).toBe(true);
  });

  it('never counts someone giving to themselves', () => {
    expect(countedGuesses([g('a', 'c', 'c')], PAIRS, 'all')).toEqual([]);
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
  it('is the small palmarès, without awards, with one or two players', () => {
    const result = palmares([g('a', 'a', 'f'), g('b', 'b', 'a')], PAIRS, 'all');
    expect(result).toEqual({
      players: 2,
      guesses: 2,
      size: 'small',
      awards: [],
    });
  });

  it('is nothing without a player', () => {
    expect(palmares([], PAIRS, 'all')).toEqual({
      players: 0,
      guesses: 0,
      size: 'none',
      awards: [],
    });
  });

  it('is small in a draw of three, whoever played', () => {
    const three = [
      { giverId: 'a', receiverId: 'b' },
      { giverId: 'b', receiverId: 'c' },
      { giverId: 'c', receiverId: 'a' },
    ];
    const guesses = [g('a', 'a', 'c'), g('b', 'b', 'a'), g('c', 'c', 'b')];
    expect(palmares(guesses, three, 'santa')).toMatchObject({
      players: 3,
      size: 'small',
      awards: [],
    });
  });

  it('gives the awards of the full palmarès (awards.test.ts)', () => {
    const guesses = [g('a', 'a', 'f'), g('b', 'b', 'a'), g('c', 'c', 'b')];
    const result = palmares(guesses, PAIRS, 'santa');
    expect(result.size).toBe('full');
    expect(result.awards.map((x) => x.kind)).toEqual(['unmasked']);
    expect(result.awards[0]).toMatchObject({
      winners: ['a', 'b', 'c'],
      value: 3,
      total: 3,
    });
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

  it('corrects one player’s guesses, their own Santa first', () => {
    const guesses = [g('a', 'c', 'e'), g('a', 'b', 'a'), g('a', 'a', 'f')];
    expect(correctedGuesses('a', guesses, PAIRS, 'all')).toEqual([
      { recipientId: 'a', guessedId: 'f', actualId: 'f', right: true },
      { recipientId: 'c', guessedId: 'e', actualId: 'b', right: false },
      { recipientId: 'b', guessedId: 'a', actualId: 'a', right: true },
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

describe('carriedGame', () => {
  it('takes the mode, the end moved to the new party', () => {
    expect(
      carriedGame(
        {
          guessMode: 'all',
          guessEndsAt: '2025-12-24T19:00:00.000Z',
          guessTimeZone: 'Europe/Paris',
          rules: { eventDate: '2025-12-24' },
        },
        '2026-12-25',
      ),
    ).toEqual({
      guessMode: 'all',
      guessEndsAt: '2026-12-25T19:00:00.000Z',
      guessTimeZone: 'Europe/Paris',
    });
  });

  it('starts without a game otherwise', () => {
    const none = { guessMode: 'none', guessEndsAt: null, guessTimeZone: null };
    expect(carriedGame(null, '2026-12-25')).toEqual(none);
    expect(
      carriedGame(
        { guessMode: 'none', guessEndsAt: null, guessTimeZone: null },
        '2026-12-25',
      ),
    ).toEqual(none);
  });
});

describe('the game and the size of the draw (Correction 12)', () => {
  it('needs four participants', () => {
    expect(gamePossible(3)).toBe(false);
    expect(gamePossible(4)).toBe(true);
  });

  it('sizes the palmarès by players and participants', () => {
    expect(palmaresSize(0, 6)).toBe('none');
    expect(palmaresSize(1, 6)).toBe('small');
    expect(palmaresSize(2, 6)).toBe('small');
    expect(palmaresSize(3, 6)).toBe('full');
    expect(palmaresSize(3, 3)).toBe('small');
    expect(palmaresSize(0, 3)).toBe('none');
  });
});
