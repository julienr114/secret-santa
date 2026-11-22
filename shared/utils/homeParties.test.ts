import { describe, expect, it } from 'vitest';
import {
  comingBirthdays,
  daysBetween,
  daysUntilChristmas,
  homeSections,
} from './homeParties';

const TODAY = '2026-11-20';

describe('daysUntilChristmas', () => {
  it('counts to 25 December, whatever the parties', () => {
    expect(daysUntilChristmas(TODAY)).toBe(35);
    expect(daysUntilChristmas('2026-12-24')).toBe(1);
    expect(daysUntilChristmas('2026-12-25')).toBe(0);
  });

  it('counts to the next one once it is past', () => {
    expect(daysUntilChristmas('2026-12-26')).toBe(364);
  });
});

describe('daysBetween', () => {
  it('counts whole days, across a change of hour', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-12-25', '2026-12-24')).toBe(-1);
  });
});

describe('homeSections', () => {
  const party = (
    name: string,
    category: 'christmas' | 'birthday',
    date: string | null,
  ) => ({
    name,
    category,
    date,
  });

  it('groups the Christmas parties of a year by date, the others after', () => {
    const { seasons, later } = homeSections([
      party('Famille Camille', 'christmas', '2026-12-25'),
      party('Les 40 ans de Tonton', 'birthday', '2027-02-08'),
      party('Bureau', 'christmas', '2026-12-19'),
      party('Chez Mamie', 'christmas', '2026-12-24'),
    ]);
    expect(seasons).toEqual([
      {
        year: 2026,
        parties: [
          party('Bureau', 'christmas', '2026-12-19'),
          party('Chez Mamie', 'christmas', '2026-12-24'),
          party('Famille Camille', 'christmas', '2026-12-25'),
        ],
      },
    ]);
    expect(later.map((p) => p.name)).toEqual(['Les 40 ans de Tonton']);
  });

  it('keeps a party a few days past at the top, and puts those without a date last', () => {
    const { seasons, later } = homeSections([
      party('Sans date', 'birthday', null),
      party('Il y a deux jours', 'birthday', '2026-11-18'),
      party('Léo', 'birthday', '2026-12-01'),
    ]);
    expect(seasons).toEqual([]);
    expect(later.map((p) => p.name)).toEqual([
      'Il y a deux jours',
      'Léo',
      'Sans date',
    ]);
  });

  it('gives each year of Christmas its section', () => {
    const { seasons } = homeSections([
      party('Plus tard', 'christmas', '2027-12-25'),
      party('Cette année', 'christmas', '2026-12-25'),
    ]);
    expect(seasons.map((season) => season.year)).toEqual([2026, 2027]);
  });
});

describe('comingBirthdays', () => {
  const zoe = {
    id: 'z',
    firstName: 'Zoé',
    birthDate: '2022-12-14',
    isSelf: false,
  };

  it('proposes a birthday within 60 days, with the age it brings', () => {
    expect(comingBirthdays([zoe], [], TODAY)).toEqual([
      { memberId: 'z', firstName: 'Zoé', date: '2026-12-14', days: 24, age: 4 },
    ]);
  });

  it('leaves out one further away, mine, and one without a birth date', () => {
    expect(
      comingBirthdays(
        [
          { ...zoe, birthDate: '2022-01-30' },
          { ...zoe, id: 'me', isSelf: true },
          { ...zoe, id: 'x', birthDate: null },
        ],
        [],
        TODAY,
      ),
    ).toEqual([]);
  });

  it('leaves out one already prepared as a party that day', () => {
    expect(
      comingBirthdays(
        [zoe],
        [{ category: 'birthday', date: '2026-12-14' }],
        TODAY,
      ),
    ).toEqual([]);
    expect(
      comingBirthdays(
        [zoe],
        [{ category: 'christmas', date: '2026-12-14' }],
        TODAY,
      ),
    ).toHaveLength(1);
  });

  it('counts across the new year, the nearest first', () => {
    expect(
      comingBirthdays(
        [{ ...zoe, id: 'a', firstName: 'Ana', birthDate: '2000-01-10' }, zoe],
        [],
        TODAY,
      ).map((b) => [b.firstName, b.date, b.age]),
    ).toEqual([
      ['Zoé', '2026-12-14', 4],
      ['Ana', '2027-01-10', 27],
    ]);
  });
});
