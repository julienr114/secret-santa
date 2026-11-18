import { describe, expect, it } from 'vitest';
import {
  canEditAvatar,
  canReveal,
  envelopeState,
  gameTile,
  openDraw,
  revealerFor,
  hintsTile,
  nextStep,
  participantSteps,
  personalPhase,
  PERSONAL_PHASES,
} from './personal';
import fc from 'fast-check';
import { failureOf } from '~~/tests/helpers';

describe('personalPhase', () => {
  it('waits until the draw, then offers the result', () => {
    expect(personalPhase('preparing')).toBe('waiting');
    expect(personalPhase('drawn')).toBe('ready');
    expect(personalPhase('closed')).toBe('closed');
  });
});

describe('canReveal', () => {
  it('refuses before the draw', () => {
    expect(failureOf(canReveal('preparing')).reason).toBe('draw_not_done');
  });

  it('allows once drawn, and still after closing', () => {
    expect(canReveal('drawn').ok).toBe(true);
    expect(canReveal('closed').ok).toBe(true);
  });
});

describe('canEditAvatar', () => {
  it('allows until the edition is closed', () => {
    expect(canEditAvatar('preparing').ok).toBe(true);
    expect(canEditAvatar('drawn').ok).toBe(true);
    expect(failureOf(canEditAvatar('closed')).reason).toBe('edition_closed');
  });
});

describe('nextStep', () => {
  const draw = {
    status: 'preparing' as const,
    revealed: false,
    hintsOn: true,
    hasHints: false,
  };

  it('asks for ideas before the draw, then waits', () => {
    expect(nextStep(draw)).toBe('addHints');
    expect(nextStep({ ...draw, hasHints: true })).toBe('wait');
    expect(nextStep({ ...draw, hintsOn: false })).toBe('wait');
  });

  it('offers to discover the result, then to see it again', () => {
    expect(nextStep({ ...draw, status: 'drawn' })).toBe('discover');
    expect(nextStep({ ...draw, status: 'drawn', revealed: true })).toBe(
      'seeAgain',
    );
  });

  it('asks for their answer to a draw made elsewhere, then says it is given', () => {
    expect(nextStep({ ...draw, answer: 'toGive' })).toBe('giveAnswer');
    expect(nextStep({ ...draw, answer: 'given' })).toBe('answerGiven');
    // Once validated, an ordinary draw.
    expect(nextStep({ ...draw, status: 'drawn', answer: null })).toBe(
      'discover',
    );
  });

  it('has nothing left to do once closed', () => {
    expect(nextStep({ ...draw, status: 'closed', revealed: true })).toBe(
      'closed',
    );
  });
});

describe('participantSteps', () => {
  const today = '2026-12-01';
  const states = (steps: ReturnType<typeof participantSteps>) =>
    steps.map((s) => s.state);

  it('waits for the draw, the party some days ahead', () => {
    const steps = participantSteps('waiting', '2026-12-25', today);
    expect(states(steps)).toEqual(['done', 'current', 'todo']);
    expect(steps[1]?.note).toBe('soon');
    expect(steps[2]).toMatchObject({ note: 'inDays', days: 24 });
  });

  it('asks for their answer when the draw was made elsewhere', () => {
    const steps = participantSteps('waiting', '2026-12-25', today, true);
    expect(states(steps)).toEqual(['done', 'current', 'todo']);
    expect(steps[1]?.note).toBe('answer');
  });

  it('says the draw is done, and the party is today', () => {
    const steps = participantSteps('ready', today, today);
    expect(states(steps)).toEqual(['done', 'current', 'todo']);
    expect(steps[1]?.note).toBe('done');
    expect(steps[2]?.note).toBe('today');
  });

  it('says a party is over once its day has passed', () => {
    expect(participantSteps('ready', '2026-11-30', today)[2]?.note).toBe(
      'over',
    );
  });

  it('adds nothing to the party without a real date', () => {
    expect(participantSteps('waiting', '', today)[2]?.note).toBeNull();
    expect(participantSteps('ready', 'Noël', today)[2]?.note).toBeNull();
  });

  it('marks everything done once closed', () => {
    const steps = participantSteps('closed', '2026-12-25', today);
    expect(states(steps)).toEqual(['done', 'done', 'done']);
    expect(steps[2]?.note).toBe('over');
  });

  it('has at most one current step, and nothing done after it', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PERSONAL_PHASES),
        fc.date({
          min: new Date('2020-01-01'),
          max: new Date('2030-12-31'),
          noInvalidDate: true,
        }),
        (phase, date) => {
          const list = states(
            participantSteps(phase, date.toISOString().slice(0, 10), today),
          );
          const current = list.indexOf('current');
          expect(list.filter((s) => s === 'current').length).toBeLessThan(2);
          if (current >= 0) {
            expect(list.slice(current + 1)).not.toContain('done');
          }
        },
      ),
    );
  });
});

describe('envelopeState', () => {
  it('is locked on a refused link, whatever the rest', () => {
    expect(envelopeState('ready', true, true)).toBe('locked');
  });

  it('waits before the draw', () => {
    expect(envelopeState('waiting', false, false)).toBe('pending');
  });

  it('stays sealed until the result was seen once, then opens', () => {
    expect(envelopeState('ready', false, false)).toBe('sealed');
    expect(envelopeState('ready', true, false)).toBe('opened');
    expect(envelopeState('closed', false, false)).toBe('sealed');
    expect(envelopeState('closed', true, false)).toBe('opened');
  });
});

describe('hintsTile', () => {
  const tile = (over: Partial<Parameters<typeof hintsTile>[0]>) =>
    hintsTile({
      giftHints: 'full',
      hasHints: false,
      hintsEditable: true,
      ...over,
    });
  it('waits for hints, then is done', () => {
    expect(tile({})).toBe('todo');
    expect(tile({ hasHints: true })).toBe('done');
  });

  it('stays once closed with hints, and is gone without', () => {
    expect(tile({ hasHints: true, hintsEditable: false })).toBe('done');
    expect(tile({ hintsEditable: false })).toBeNull();
  });

  it('is gone when the group has no hints', () => {
    expect(tile({ giftHints: 'none', hasHints: true })).toBeNull();
  });
});

describe('gameTile', () => {
  const game = (over: Partial<NonNullable<Parameters<typeof gameTile>[0]>>) =>
    gameTile({
      open: true,
      played: false,
      revealed: false,
      palmares: false,
      seen: false,
      ...over,
    });
  it('asks for a guess, then says it is made', () => {
    expect(game({})).toBe('play');
    expect(game({ played: true })).toBe('played');
  });

  it('waits for the party once closed', () => {
    expect(game({ open: false })).toBe('waiting');
  });

  it('offers the palmarès once revealed, then the answers, if anyone played', () => {
    expect(game({ open: false, revealed: true, palmares: true })).toBe(
      'palmares',
    );
    expect(
      game({ open: false, revealed: true, palmares: true, seen: true }),
    ).toBe('answers');
    expect(game({ open: false, revealed: true })).toBeNull();
  });

  it('is gone when the game is off', () => {
    expect(gameTile(null)).toBeNull();
  });
});

describe('openDraw', () => {
  // a → b → c → d → a.
  const PAIRS = [
    { giverId: 'c', receiverId: 'd' },
    { giverId: 'a', receiverId: 'b' },
    { giverId: 'd', receiverId: 'a' },
    { giverId: 'b', receiverId: 'c' },
  ];
  it('gives who I give to, who gives to me, and every pair in order', () => {
    const view = openDraw(PAIRS, 'a', ['a', 'b', 'c', 'd']);
    expect(view.ok && view.value).toEqual({
      receiverId: 'b',
      santaId: 'd',
      pairs: [
        { giverId: 'a', receiverId: 'b' },
        { giverId: 'b', receiverId: 'c' },
        { giverId: 'c', receiverId: 'd' },
        { giverId: 'd', receiverId: 'a' },
      ],
    });
  });

  it('refuses someone out of the draw', () => {
    expect(failureOf(openDraw(PAIRS, 'z', [])).reason).toBe('result_not_found');
  });
});

describe('revealerFor', () => {
  const names = { o: 'Camille' };
  it('says « Tu », a name, or nobody known', () => {
    expect(revealerFor('a', 'a', names)).toEqual({ kind: 'me' });
    expect(revealerFor('o', 'a', names)).toEqual({
      kind: 'name',
      name: 'Camille',
    });
    expect(revealerFor('x', 'a', names)).toBeNull();
    expect(revealerFor(null, 'a', names)).toBeNull();
  });
});
