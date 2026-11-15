import { describe, expect, it } from 'vitest';
import {
  canEditAvatar,
  canEditWishes,
  canReveal,
  nextStep,
  personalPhase,
} from './personal';
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

describe('canEditWishes', () => {
  const on = { wishlist: true };

  it('allows from the creation of the edition until it is closed', () => {
    expect(canEditWishes('preparing', on).ok).toBe(true);
    expect(canEditWishes('drawn', on).ok).toBe(true);
  });

  it('refuses a closed edition', () => {
    expect(failureOf(canEditWishes('closed', on)).reason).toBe(
      'edition_closed',
    );
  });

  it('refuses when the group does not use wish lists, whatever the status', () => {
    expect(
      failureOf(canEditWishes('preparing', { wishlist: false })).reason,
    ).toBe('wishlist_disabled');
    expect(failureOf(canEditWishes('closed', { wishlist: false })).reason).toBe(
      'wishlist_disabled',
    );
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
