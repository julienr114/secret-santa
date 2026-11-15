import { describe, it, expect } from 'vitest';
import {
  addWaiver,
  applyWaivers,
  buildHistory,
  canEditParticipants,
  canSendLinks,
  checkParticipantCount,
  currentEdition,
  historyEditions,
  MAX_PARTICIPANTS,
  nextEditionDefaults,
  nextStatus,
  parseWaivers,
  participantBadges,
  previousEdition,
  editionStep,
  followState,
  participantCounters,
  sortParticipants,
} from './editions';
import fc from 'fast-check';
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
    ed(2026, 'preparing'),
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
      participantBadges({ messageSentAt: 'x', viewCount: 2, wishesCount: 3 }),
    ).toEqual(['sent', 'wishes', 'viewed']);
    expect(participantBadges({ viewCount: 0, wishesCount: 0 })).toEqual([]);
  });
});

describe('nextStatus', () => {
  it('follows the README lifecycle', () => {
    expect(valueOf(nextStatus('preparing', 'draw'))).toBe('drawn');
    expect(valueOf(nextStatus('drawn', 'cancel_draw'))).toBe('preparing');
    expect(valueOf(nextStatus('drawn', 'close'))).toBe('closed');
  });

  it('refuses everything else, including a second draw', () => {
    expect(failureOf(nextStatus('drawn', 'draw'))).toEqual({
      ok: false,
      reason: 'invalid_transition',
      details: { status: 'drawn', action: 'draw', expected: 'preparing' },
    });
    expect(nextStatus('closed', 'draw').ok).toBe(false);
    expect(nextStatus('closed', 'cancel_draw').ok).toBe(false);
    expect(nextStatus('preparing', 'close').ok).toBe(false);
  });

  it('says when participants and links can change', () => {
    expect(canEditParticipants('preparing')).toBe(true);
    expect([
      canEditParticipants('drawn'),
      canEditParticipants('closed'),
    ]).toEqual([false, false]);
    expect([
      canSendLinks('preparing'),
      canSendLinks('drawn'),
      canSendLinks('closed'),
    ]).toEqual([true, true, false]);
  });
});

describe('history', () => {
  const editions = [
    { id: 'e2023', year: 2023, status: 'closed', createdAt: '2023-11-01' },
    { id: 'e2024', year: 2024, status: 'closed', createdAt: '2024-11-01' },
    { id: 'e2025', year: 2025, status: 'closed', createdAt: '2025-11-01' },
    { id: 'e2026', year: 2026, status: 'preparing', createdAt: '2026-11-01' },
    { id: 'eOpen', year: 2022, status: 'preparing', createdAt: '2022-11-01' },
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
});

describe('history waivers', () => {
  it('parses stored waivers and drops junk', () => {
    expect(
      parseWaivers([{ giverId: 'a', receiverId: 'b' }, { giverId: 'a' }, 'x']),
    ).toEqual([{ giverId: 'a', receiverId: 'b' }]);
    expect(parseWaivers(null)).toEqual([]);
  });

  it('adds a waiver only once', () => {
    const once = addWaiver([], { giverId: 'a', receiverId: 'b' });
    expect(addWaiver(once, { giverId: 'a', receiverId: 'b' })).toBe(once);
    expect(addWaiver(once, { giverId: 'b', receiverId: 'a' })).toHaveLength(2);
  });

  it('removes waived pairs from the history, one way only', () => {
    const history = { a: ['b', 'c'], b: ['a'] };
    expect(applyWaivers(history, [{ giverId: 'a', receiverId: 'b' }])).toEqual({
      a: ['c'],
      b: ['a'],
    });
    expect(applyWaivers(history, [])).toEqual(history);
  });
});

describe('checkParticipantCount', () => {
  it('allows up to the limit and refuses one more', () => {
    expect(checkParticipantCount(MAX_PARTICIPANTS)).toEqual({
      ok: true,
      value: MAX_PARTICIPANTS,
    });
    expect(checkParticipantCount(MAX_PARTICIPANTS + 1)).toEqual({
      ok: false,
      reason: 'too_many_participants',
      details: { max: 100, count: 101 },
    });
  });
});

describe('editionStep', () => {
  it('prepares until the draw, follows it until the party', () => {
    expect(editionStep('preparing', '2026-12-25', '2026-12-30')).toBe(
      'prepare',
    );
    expect(editionStep('drawn', '2026-12-25', '2026-12-24')).toBe('drawn');
    expect(editionStep('drawn', '2026-12-25', '2026-12-25')).toBe('party');
    expect(editionStep('closed', '2026-12-25', '2026-12-01')).toBe('party');
  });

  it('stays on the follow-up without a real date', () => {
    expect(editionStep('drawn', '', '2027-01-01')).toBe('drawn');
    expect(editionStep('drawn', '25 décembre', '2027-01-01')).toBe('drawn');
    expect(editionStep('drawn', null, '2027-01-01')).toBe('drawn');
  });
});

describe('follow-up of the participants', () => {
  const person = (firstName: string, sent: boolean, views: number) => ({
    firstName,
    messageSentAt: sent ? '2026-12-01T10:00:00Z' : null,
    viewCount: views,
  });
  const people = [
    person('Rose', false, 0),
    person('Camille', true, 2),
    person('Hugo', true, 0),
    person('Inès', false, 0),
    person('Zoé', false, 1),
  ];

  it('tells where each one stands, having looked first', () => {
    expect(people.map(followState)).toEqual([
      'toNotify',
      'viewed',
      'notOpened',
      'toNotify',
      'viewed',
    ]);
  });

  it('counts each state', () => {
    expect(participantCounters(people)).toEqual({
      toNotify: 2,
      notOpened: 1,
      viewed: 2,
    });
    expect(participantCounters([])).toEqual({
      toNotify: 0,
      notOpened: 0,
      viewed: 0,
    });
  });

  it('lists the ones to notify first after the draw, by name in each', () => {
    expect(sortParticipants(people, 'drawn').map((p) => p.firstName)).toEqual([
      'Inès',
      'Rose',
      'Hugo',
      'Camille',
      'Zoé',
    ]);
  });

  it('lists by name while preparing, without touching the list', () => {
    const copy = [...people];
    expect(
      sortParticipants(people, 'preparing').map((p) => p.firstName),
    ).toEqual(['Camille', 'Hugo', 'Inès', 'Rose', 'Zoé']);
    expect(people).toEqual(copy);
  });

  it('keeps everyone, and the counts add up', () => {
    const arbitrary = fc.array(
      fc.record({
        firstName: fc.string(),
        messageSentAt: fc.option(fc.constant('2026-12-01'), { nil: null }),
        viewCount: fc.nat(3),
      }),
    );
    fc.assert(
      fc.property(arbitrary, (list) => {
        const sorted = sortParticipants(list, 'drawn');
        expect(sorted).toHaveLength(list.length);
        const counts = participantCounters(list);
        expect(counts.toNotify + counts.notOpened + counts.viewed).toBe(
          list.length,
        );
        const states = sorted.map(followState);
        expect(states).toEqual(
          states.toSorted(
            (a, b) =>
              ['toNotify', 'notOpened', 'viewed'].indexOf(a) -
              ['toNotify', 'notOpened', 'viewed'].indexOf(b),
          ),
        );
      }),
    );
  });
});
