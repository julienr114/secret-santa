import { describe, expect, it } from 'vitest';
import { deedsOf, yearKey, type PartyList } from './pastYears';

const list = (id: string, year: number, partyId = 'p'): PartyList => ({
  id,
  partyId,
  accountId: 'a',
  shareToken: id,
  visibility: 'party',
  year,
});

const counts = {
  offered: new Map([
    ['other2025', 2],
    ['other2026', 1],
  ]),
  received: new Map([['mine2025', 8]]),
  ideas: new Map<string, number>(),
};

describe('deedsOf', () => {
  const input = {
    years: [
      { partyId: 'p', year: 2025 },
      { partyId: 'p', year: 2024 },
    ],
    loaded: [
      { partyId: 'p', year: 2025, santas: [{ id: 's2025' }] },
      { partyId: 'p', year: 2024, santas: [{ id: 's2024' }] },
    ],
    receivers: new Map([['s2024', 'Camille']]),
    lists: [
      list('mine2025', 2025),
      list('other2025', 2025),
      list('other2026', 2026),
      list('elsewhere', 2025, 'q'),
    ],
    held: new Set(['mine2025']),
    counts,
  };

  it('says whom I gave to, from my own result of that year', () => {
    expect(deedsOf(input).get(yearKey('p', 2024))).toEqual({
      kind: 'gaveTo',
      names: ['Camille'],
    });
  });

  it('counts the gifts I ticked on the lists of that year only', () => {
    expect(deedsOf(input).get(yearKey('p', 2025))).toEqual({
      kind: 'offered',
      count: 2,
    });
  });

  it('counts the gifts given on my lists, when I ticked nothing', () => {
    const deeds = deedsOf({
      ...input,
      counts: { ...counts, offered: new Map() },
    });
    expect(deeds.get(yearKey('p', 2025))).toEqual({
      kind: 'received',
      count: 8,
    });
  });

  it('says nothing without anything done', () => {
    const deeds = deedsOf({
      ...input,
      receivers: new Map(),
      held: new Set(),
      counts: { ...counts, offered: new Map() },
    });
    expect(deeds.get(yearKey('p', 2025))).toBeNull();
    expect(deeds.get(yearKey('p', 2024))).toBeNull();
  });
});
