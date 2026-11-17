import { describe, expect, it } from 'vitest';
import {
  canEditAvatar,
  canReveal,
  envelopeState,
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
    wishlist: true,
    wishesCount: 0,
  };

  it('asks for ideas before the draw, then waits', () => {
    expect(nextStep(draw)).toBe('addWishes');
    expect(nextStep({ ...draw, wishesCount: 2 })).toBe('wait');
    expect(nextStep({ ...draw, wishlist: false })).toBe('wait');
  });

  it('offers to discover the result, then to see it again', () => {
    expect(nextStep({ ...draw, status: 'drawn' })).toBe('discover');
    expect(nextStep({ ...draw, status: 'drawn', revealed: true })).toBe(
      'seeAgain',
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
