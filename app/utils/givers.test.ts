import { describe, expect, it } from 'vitest';
import { giverPills } from './givers';

const avatar = { emoji: '🦌', color: 'plum' } as const;
const group = (...names: string[]) => ({
  kind: 'group' as const,
  closed: false,
  mine: false,
  leads: false,
  people: names.map((name) => ({ name, avatar })),
});

describe('those who give an idea, one pill each', () => {
  it('has none for an idea nobody gives, or that I give alone', () => {
    expect(giverPills({ kind: 'free' }, [])).toEqual([]);
    expect(
      giverPills({ kind: 'mine', mode: 'alone', anonymous: false }, []),
    ).toEqual([]);
  });

  it('is one pill for one first name, with its tick to take off', () => {
    expect(
      giverPills({ kind: 'taken', by: 'Mamie' }, [
        { id: 'c1', by: 'Mamie', at: '2026-11-12T10:00:00.000Z' },
      ]),
    ).toEqual([{ name: 'Mamie', claimId: 'c1' }]);
  });

  it('says « Anonyme » by a pill without a name, which unticks too', () => {
    expect(
      giverPills({ kind: 'taken', by: null }, [
        { id: 'c1', by: null, at: null },
      ]),
    ).toEqual([{ name: null, claimId: 'c1' }]);
  });

  it('shows nothing to who does not hold the list: the box says « pris »', () => {
    expect(giverPills({ kind: 'taken', by: null }, [])).toEqual([]);
  });

  it('gives each of several their own pill and their own tick', () => {
    expect(
      giverPills(group('Mamie', 'Camille', 'Tonton'), [
        { id: 'c1', by: 'Mamie', at: 'a' },
        { id: 'c3', by: 'Tonton', at: 'c' },
      ]),
    ).toEqual([
      { name: 'Mamie', claimId: 'c1' },
      // Mine: never taken off from here.
      { name: 'Camille', claimId: null },
      { name: 'Tonton', claimId: 'c3' },
    ]);
  });

  it('tells two people of the same first name apart, in their order', () => {
    expect(
      giverPills(group('Léa', 'Léa'), [
        { id: 'c1', by: 'Léa', at: 'a' },
        { id: 'c2', by: 'Léa', at: 'b' },
      ]),
    ).toEqual([
      { name: 'Léa', claimId: 'c1' },
      { name: 'Léa', claimId: 'c2' },
    ]);
  });
});
