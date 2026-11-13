import { describe, it, expect } from 'vitest';
import {
  currentEdition,
  nextEditionDefaults,
  participantBadges,
  previousEdition,
  buildHistory,
  canEditParticipants,
  canSendLinks,
  historyEditions,
  missingPins,
  nextStatus,
} from './editions';
import { failureOf, valueOf } from '~~/tests/helpers';

const ed = (year: number, status: string, createdAt = `${year}-11-01`) => ({
  year,
  status,
  createdAt,
});

describe('nextEditionDefaults', () => {
  it('proposes this year, or the next one if this year exists', () => {
    expect(nextEditionDefaults([], '2026-11-13')).toEqual({
      label: 'Noël 2026',
      year: 2026,
    });
    expect(nextEditionDefaults([ed(2026, 'drawn')], '2026-11-13').year).toBe(
      2027,
    );
    expect(nextEditionDefaults([ed(2024, 'closed')], '2026-11-13').year).toBe(
      2026,
    );
  });
});

describe('currentEdition / previousEdition', () => {
  const editions = [
    ed(2024, 'closed'),
    ed(2025, 'closed'),
    ed(2026, 'invitations'),
  ];
  it('picks the latest open edition and the one before a given year', () => {
    expect(currentEdition(editions)?.year).toBe(2026);
    expect(currentEdition([ed(2024, 'closed')])).toBeNull();
    expect(previousEdition(editions, 2026)?.year).toBe(2025);
    expect(previousEdition(editions, 2027)?.year).toBe(2026);
    expect(previousEdition([], 2026)).toBeNull();
  });
});

describe('participantBadges', () => {
  it('lists the badges in display order', () => {
    expect(
      participantBadges({
        messageSentAt: 'x',
        viewCount: 2,
        hasPin: true,
        pinLocked: true,
        wishesCount: 3,
      }),
    ).toEqual(['sent', 'pin_set', 'wishes', 'viewed', 'locked']);
    expect(
      participantBadges({ viewCount: 0, hasPin: false, wishesCount: 0 }),
    ).toEqual([]);
  });
});

describe('nextStatus', () => {
  it('follows the README lifecycle', () => {
    expect(valueOf(nextStatus('draft', 'open'))).toBe('invitations');
    expect(valueOf(nextStatus('invitations', 'draw'))).toBe('drawn');
    expect(valueOf(nextStatus('drawn', 'cancel_draw'))).toBe('invitations');
    expect(valueOf(nextStatus('drawn', 'close'))).toBe('closed');
  });

  it('refuses everything else, including a second draw', () => {
    expect(failureOf(nextStatus('drawn', 'draw'))).toEqual({
      ok: false,
      reason: 'invalid_transition',
      details: { status: 'drawn', action: 'draw', expected: 'invitations' },
    });
    expect(nextStatus('draft', 'draw').ok).toBe(false);
    expect(nextStatus('closed', 'cancel_draw').ok).toBe(false);
    expect(nextStatus('invitations', 'close').ok).toBe(false);
  });

  it('says when participants and links can change', () => {
    expect([
      canEditParticipants('draft'),
      canEditParticipants('invitations'),
    ]).toEqual([true, true]);
    expect([
      canEditParticipants('drawn'),
      canEditParticipants('closed'),
    ]).toEqual([false, false]);
    expect([
      canSendLinks('draft'),
      canSendLinks('invitations'),
      canSendLinks('drawn'),
      canSendLinks('closed'),
    ]).toEqual([false, true, true, false]);
  });
});

describe('history', () => {
  const editions = [
    { id: 'e2023', year: 2023, status: 'closed', createdAt: '2023-11-01' },
    { id: 'e2024', year: 2024, status: 'closed', createdAt: '2024-11-01' },
    { id: 'e2025', year: 2025, status: 'closed', createdAt: '2025-11-01' },
    { id: 'e2026', year: 2026, status: 'invitations', createdAt: '2026-11-01' },
    { id: 'eDraft', year: 2022, status: 'draft', createdAt: '2022-11-01' },
  ];
  const assignments = [
    { editionId: 'e2024', giverId: 'a', receiverId: 'b' },
    { editionId: 'e2025', giverId: 'a', receiverId: 'c' },
    { editionId: 'e2025', giverId: 'b', receiverId: 'a' },
    { editionId: 'e2023', giverId: 'a', receiverId: 'd' },
  ];

  it('takes the N latest drawn or closed editions, never the current one', () => {
    expect(historyEditions(editions, 'e2026', 1).map((e) => e.id)).toEqual([
      'e2025',
    ]);
    expect(historyEditions(editions, 'e2026', 2).map((e) => e.id)).toEqual([
      'e2025',
      'e2024',
    ]);
    expect(historyEditions(editions, 'e2026', 0)).toEqual([]);
    expect(historyEditions(editions, 'e2025', 5).map((e) => e.id)).toEqual([
      'e2024',
      'e2023',
    ]);
  });

  it('builds giver -> past receivers, only for editions the giver took part in', () => {
    expect(buildHistory(assignments, ['e2025'])).toEqual({
      a: ['c'],
      b: ['a'],
    });
    expect(buildHistory(assignments, ['e2025', 'e2024'])).toEqual({
      a: ['b', 'c'],
      b: ['a'],
    });
    expect(buildHistory(assignments, [])).toEqual({});
  });

  it('lists participants without a code', () => {
    expect(
      missingPins([
        { id: 'a', hasPin: true },
        { id: 'b', hasPin: false },
      ]),
    ).toEqual([{ id: 'b', hasPin: false }]);
  });
});
