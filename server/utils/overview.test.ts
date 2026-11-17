import { describe, expect, it } from 'vitest';
import {
  groupOverviews,
  groupsByAccount,
  type OverviewEdition,
} from './overview';

const edition = (
  id: string,
  groupId: string,
  year: number,
  status: string,
): OverviewEdition => ({
  id,
  groupId,
  year,
  status,
  createdAt: `${year}-11-01T10:00:00.000Z`,
});

describe('groupOverviews', () => {
  const editions = [
    edition('e1', 'g1', 2025, 'closed'),
    edition('e2', 'g1', 2026, 'drawn'),
    edition('e3', 'g2', 2026, 'preparing'),
    edition('e4', 'g3', 2025, 'closed'),
  ];
  const counts = {
    e2: { participants: 5, viewed: 1 },
    e3: { participants: 4, viewed: 0 },
  };
  const overviews = groupOverviews(
    ['g1', 'g2', 'g3', 'g4'],
    { g1: 5, g2: 4, g3: 3 },
    editions,
    counts,
  );

  it('tells where the draw in progress stands', () => {
    expect(overviews.g1).toEqual({
      members: 5,
      draw: { status: 'drawn', participants: 5, viewed: 1 },
    });
    expect(overviews.g2?.draw).toEqual({
      status: 'preparing',
      participants: 4,
      viewed: 0,
    });
  });

  it('has no draw when every edition is closed, or there is none', () => {
    expect(overviews.g3).toEqual({ members: 3, draw: null });
    expect(overviews.g4).toEqual({ members: 0, draw: null });
  });

  it('counts nobody in an edition without participants', () => {
    const [only] = Object.values(
      groupOverviews(['g'], {}, [edition('e', 'g', 2026, 'preparing')], {}),
    );
    expect(only?.draw).toEqual({
      status: 'preparing',
      participants: 0,
      viewed: 0,
    });
  });
});

describe('groupsByAccount', () => {
  const group = (accountId: string, id: string) => ({
    accountId,
    id,
    slug: id,
    name: id.toUpperCase(),
  });

  it('lists the groups organised, then those taken part in', () => {
    expect(
      groupsByAccount([group('a', 'g1')], [group('a', 'g2'), group('b', 'g1')]),
    ).toEqual({
      a: [
        { id: 'g1', slug: 'g1', name: 'G1', role: 'organizer' },
        { id: 'g2', slug: 'g2', name: 'G2', role: 'participant' },
      ],
      b: [{ id: 'g1', slug: 'g1', name: 'G1', role: 'participant' }],
    });
  });

  it('keeps a group once, as organised, when the account is in it too', () => {
    expect(groupsByAccount([group('a', 'g1')], [group('a', 'g1')])).toEqual({
      a: [{ id: 'g1', slug: 'g1', name: 'G1', role: 'organizer' }],
    });
  });
});
