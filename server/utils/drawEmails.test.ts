import { describe, expect, it } from 'vitest';
import { drawEmailTargets, drawEmailsState, reachOf } from './drawEmails';

describe('the draw emails (ticket 169)', () => {
  it('reaches by email those with an address that takes our emails', () => {
    expect(reachOf({ email: 'a@x.fr', blocked: false, choice: null })).toBe(
      'email',
    );
    expect(
      reachOf({ email: 'a@x.fr', blocked: false, choice: 'summary' }),
    ).toBe('email');
    expect(reachOf({ email: null, blocked: false, choice: null })).toBe(
      'noAddress',
    );
    expect(reachOf({ email: 'a@x.fr', blocked: true, choice: null })).toBe(
      'noEmails',
    );
    expect(reachOf({ email: 'a@x.fr', blocked: false, choice: 'none' })).toBe(
      'noEmails',
    );
  });

  it('writes once, to those reached by email, the chosen ones if any', () => {
    const people = [
      { participationId: 'a', reach: 'email' as const, messageSentAt: null },
      { participationId: 'b', reach: 'email' as const, messageSentAt: 'x' },
      {
        participationId: 'c',
        reach: 'noAddress' as const,
        messageSentAt: null,
      },
      { participationId: 'd', reach: 'noEmails' as const, messageSentAt: null },
      { participationId: 'e', reach: 'email' as const, messageSentAt: null },
    ];
    expect(drawEmailTargets(people).map((p) => p.participationId)).toEqual([
      'a',
      'e',
    ]);
    expect(
      drawEmailTargets(people, ['e', 'c']).map((p) => p.participationId),
    ).toEqual(['e']);
  });

  it('says whether the emails failed, someone is left, or all is done', () => {
    const told = { reach: 'email' as const, messageSentAt: 'x', viewCount: 0 };
    expect(drawEmailsState([told])).toBe('sent');
    expect(
      drawEmailsState([
        told,
        { reach: 'noAddress', messageSentAt: null, viewCount: 0 },
      ]),
    ).toBe('manual');
    // Someone who looked was told, whatever way.
    expect(
      drawEmailsState([
        told,
        { reach: 'noAddress', messageSentAt: null, viewCount: 1 },
      ]),
    ).toBe('sent');
    expect(
      drawEmailsState([
        { reach: 'email', messageSentAt: null, viewCount: 0 },
        { reach: 'noAddress', messageSentAt: null, viewCount: 0 },
      ]),
    ).toBe('failed');
  });
});
