import { describe, expect, it } from 'vitest';
import {
  anonymousRefusal,
  canLinkList,
  chooseMode,
  dismissNotice,
  drawStillSecret,
  modeView,
  settleMode,
  signParticipation,
  verifyParticipation,
} from './anonymous';

const fresh = { anonymous: null, notice: null };
const plain = { detected: false, asked: false, named: true };

describe('my mode on a list, as I open it', () => {
  it('is under my first name by default, and nothing is decided', () => {
    expect(settleMode(fresh, plain)).toEqual(fresh);
    expect(modeView(fresh)).toEqual({ anonymous: false, notice: false });
  });

  it('is anonymous when the address asks, or without a first name', () => {
    expect(settleMode(fresh, { ...plain, asked: true }).anonymous).toBe(true);
    expect(settleMode(fresh, { ...plain, named: false }).anonymous).toBe(true);
    // No note: nobody turned it on for me.
    expect(modeView(settleMode(fresh, { ...plain, asked: true })).notice).toBe(
      false,
    );
  });

  it('is turned on by a draw found, with its note', () => {
    const row = settleMode(fresh, { ...plain, detected: true });
    expect(row).toEqual({ anonymous: true, notice: 'pending' });
    expect(modeView(row)).toEqual({ anonymous: true, notice: true });
  });

  it('is turned on by a draw even after I chose my first name, once', () => {
    const chosen = { anonymous: false, notice: null };
    const row = settleMode(chosen, { ...plain, detected: true });
    expect(row).toEqual({ anonymous: true, notice: 'pending' });
    // Never imposed: turned off, it stays off, draw or not.
    const off = chooseMode(row, false);
    expect(off).toEqual({ anonymous: false, notice: 'seen' });
    expect(settleMode(off, { ...plain, detected: true, asked: true })).toEqual(
      off,
    );
  });

  it('keeps a choice made, whatever the address says', () => {
    const chosen = { anonymous: false, notice: null };
    expect(settleMode(chosen, { ...plain, asked: true })).toEqual(chosen);
    expect(settleMode(chosen, { ...plain, named: false })).toEqual(chosen);
  });

  it('loses its note at « Compris », and stays on', () => {
    const row = dismissNotice({ anonymous: true, notice: 'pending' });
    expect(row).toEqual({ anonymous: true, notice: 'seen' });
    expect(modeView(row)).toEqual({ anonymous: true, notice: false });
    expect(dismissNotice(fresh)).toEqual(fresh);
  });
});

describe('a draw still a secret', () => {
  const draw = { status: 'drawn', revealedAt: null, eventDate: '2026-12-24' };

  it('is one drawn, not revealed, whose party is not past', () => {
    expect(drawStillSecret(draw, '2026-11-20')).toBe(true);
    expect(drawStillSecret(draw, '2026-12-24')).toBe(true);
    expect(drawStillSecret({ ...draw, eventDate: '' }, '2026-11-20')).toBe(
      true,
    );
  });

  it('is no longer one after the party, the reveal, or before the draw', () => {
    expect(drawStillSecret(draw, '2026-12-25')).toBe(false);
    expect(
      drawStillSecret({ ...draw, revealedAt: '2026-11-20T10:00:00.000Z' }, ''),
    ).toBe(false);
    expect(
      drawStillSecret({ ...draw, status: 'preparing' }, '2026-11-20'),
    ).toBe(false);
    expect(drawStillSecret({ ...draw, status: 'closed' }, '2026-11-20')).toBe(
      false,
    );
  });
});

describe('a list linked to my hints', () => {
  it('is one of mine, and shared', () => {
    expect(canLinkList({ shared: true })).toBe(true);
    expect(canLinkList({ shared: false })).toBe(false);
    expect(canLinkList(undefined)).toBe(false);
  });
});

describe('the participation a link from a draw carries', () => {
  it('is read back by who has the secret', async () => {
    const text = await signParticipation('part-1', 'secret');
    expect(await verifyParticipation(text, 'secret')).toBe('part-1');
  });

  it('cannot be made up, nor moved to another participation', async () => {
    const text = await signParticipation('part-1', 'secret');
    const [, mac] = text.split('.');
    expect(await verifyParticipation(`part-2.${mac}`, 'secret')).toBeNull();
    expect(await verifyParticipation(text, 'elsewhere')).toBeNull();
    expect(await verifyParticipation('part-1', 'secret')).toBeNull();
    expect(await verifyParticipation('part-1.!!!', 'secret')).toBeNull();
    expect(await verifyParticipation(null, 'secret')).toBeNull();
    expect(await verifyParticipation(text, '')).toBeNull();
  });
});

describe('what the anonymous mode forbids', () => {
  it('lets anything pass while the mode is off', () => {
    expect(anonymousRefusal(false, { mode: 'group', anonymous: false })).toBe(
      null,
    );
    expect(anonymousRefusal(false, { joins: true })).toBe(null);
  });
  it('lets « seul, en anonyme » and what does not choose pass', () => {
    expect(anonymousRefusal(true, { mode: 'alone', anonymous: true })).toBe(
      null,
    );
    expect(anonymousRefusal(true, {})).toBe(null);
  });
  it('refuses my first name, and giving with others', () => {
    expect(anonymousRefusal(true, { anonymous: false })).toBe('anonymous_mode');
    expect(anonymousRefusal(true, { mode: 'group' })).toBe('anonymous_mode');
    expect(anonymousRefusal(true, { joins: true })).toBe('anonymous_mode');
  });
});
