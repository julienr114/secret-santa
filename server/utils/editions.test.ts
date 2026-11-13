import { describe, it, expect } from 'vitest';
import {
  currentEdition,
  nextEditionDefaults,
  participantBadges,
  previousEdition,
} from './editions';

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
