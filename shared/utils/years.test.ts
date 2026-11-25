import { describe, expect, it } from 'vitest';
import {
  labelForYear,
  listToResume,
  listIsPast,
  listYear,
  partyTimeline,
  reopensYear,
  pastByYear,
  pastBand,
  pastDeed,
  pastSummary,
  stillOnHome,
  yearIsOver,
  yearToPrepare,
} from './years';

const CHRISTMAS = { recurring: true, usualDate: '12-25' };
const WEDDING = { recurring: false, usualDate: '06-13' };
const open = [{ status: 'drawn' }];
const closed = [{ status: 'closed' }];

describe('stillOnHome', () => {
  it('keeps an event until its date', () => {
    expect(stillOnHome({ date: '2026-12-25', santas: [] }, '2026-11-20')).toBe(
      true,
    );
    expect(stillOnHome({ date: '2026-12-25', santas: [] }, '2026-12-25')).toBe(
      true,
    );
    expect(stillOnHome({ date: null, santas: [] }, '2030-01-01')).toBe(true);
  });

  it('keeps an event without a Secret Santa 3 days after its date', () => {
    const year = { date: '2026-12-25', santas: [] };
    expect(stillOnHome(year, '2026-12-28')).toBe(true);
    expect(stillOnHome(year, '2026-12-29')).toBe(false);
  });

  it('keeps an event while its Secret Santa is not closed, 14 days at most', () => {
    expect(
      stillOnHome({ date: '2026-12-25', santas: open }, '2027-01-08'),
    ).toBe(true);
    expect(
      stillOnHome({ date: '2026-12-25', santas: open }, '2027-01-09'),
    ).toBe(false);
  });

  it('lets an event go once its Secret Santa is closed', () => {
    expect(
      stillOnHome({ date: '2026-12-25', santas: closed }, '2026-12-26'),
    ).toBe(false);
    expect(
      stillOnHome(
        { date: '2026-12-25', santas: [...closed, ...open] },
        '2026-12-30',
      ),
    ).toBe(true);
  });
});

describe('partyTimeline', () => {
  const y2025 = { year: 2025, date: '2025-12-25', santas: closed };
  const y2026 = { year: 2026, date: '2026-12-25', santas: open };

  it('is at its latest year while the home keeps it', () => {
    expect(partyTimeline(CHRISTMAS, [y2025, y2026], '2026-12-30')).toEqual({
      current: { year: 2026, date: '2026-12-25' },
      past: [{ year: 2025, date: '2025-12-25' }],
    });
  });

  it('moves to the year after, for an event that comes back', () => {
    expect(partyTimeline(CHRISTMAS, [y2025, y2026], '2027-01-10')).toEqual({
      current: { year: 2027, date: '2027-12-25' },
      past: [
        { year: 2026, date: '2026-12-25' },
        { year: 2025, date: '2025-12-25' },
      ],
    });
  });

  it('keeps the date of a year already made', () => {
    const y2027 = { year: 2027, date: '2027-12-24', santas: [] };
    expect(
      partyTimeline(CHRISTMAS, [y2026, y2027], '2027-01-10').current,
    ).toEqual({ year: 2027, date: '2027-12-24' });
  });

  it('is over for good for an event that does not come back', () => {
    const year = { year: 2026, date: '2026-06-13', santas: [] };
    expect(partyTimeline(WEDDING, [year], '2026-06-16').current).not.toBeNull();
    expect(partyTimeline(WEDDING, [year], '2026-06-17')).toEqual({
      current: null,
      past: [{ year: 2026, date: '2026-06-13' }],
    });
  });

  it('shows an event without a year undated', () => {
    expect(partyTimeline(WEDDING, [], '2026-11-20')).toEqual({
      current: { year: 2026, date: null },
      past: [],
    });
  });
});

describe('yearIsOver', () => {
  it('is over before the current year, or for an event over', () => {
    const timeline = partyTimeline(
      CHRISTMAS,
      [{ year: 2026, date: '2026-12-25', santas: closed }],
      '2027-01-10',
    );
    expect(yearIsOver(timeline, 2026)).toBe(true);
    expect(yearIsOver(timeline, 2027)).toBe(false);
    expect(yearIsOver({ current: null, past: [] }, 2030)).toBe(true);
  });
});

describe('listYear', () => {
  it('is the year of its date, else of its creation', () => {
    expect(
      listYear({ eventDate: '2027-01-05', createdAt: '2026-12-01T10:00:00Z' }),
    ).toBe(2027);
    expect(
      listYear({ eventDate: null, createdAt: '2026-12-01T10:00:00Z' }),
    ).toBe(2026);
  });
});

describe('yearToPrepare', () => {
  const base = {
    organiser: true,
    recurring: true,
    current: { year: 2027, date: '2027-12-25' },
    santas: 0,
    santasBefore: 2,
  };

  it('offers the year to come two months before, to the organiser', () => {
    expect(yearToPrepare(base, '2027-10-26')).toBe(2027);
    expect(yearToPrepare(base, '2027-10-25')).toBeNull();
    expect(
      yearToPrepare({ ...base, organiser: false }, '2027-11-01'),
    ).toBeNull();
  });

  it('offers nothing once prepared, without a Secret Santa before, or once', () => {
    expect(yearToPrepare({ ...base, santas: 1 }, '2027-11-01')).toBeNull();
    expect(
      yearToPrepare({ ...base, santasBefore: 0 }, '2027-11-01'),
    ).toBeNull();
    expect(
      yearToPrepare({ ...base, recurring: false }, '2027-11-01'),
    ).toBeNull();
  });
});

describe('listToResume', () => {
  const base = {
    recurring: true,
    current: { year: 2027, date: '2027-12-25' },
    mine: [
      { id: 'l2026', year: 2026 },
      { id: 'l2025', year: 2025 },
    ],
  };

  it('offers my latest list of before, two months before', () => {
    expect(listToResume(base, '2027-11-01')).toBe('l2026');
    expect(listToResume(base, '2027-09-01')).toBeNull();
  });

  it('offers nothing once I have a list this year, or none before', () => {
    expect(
      listToResume(
        { ...base, mine: [{ id: 'l2027', year: 2027 }, ...base.mine] },
        '2027-11-01',
      ),
    ).toBeNull();
    expect(listToResume({ ...base, mine: [] }, '2027-11-01')).toBeNull();
  });
});

describe('labelForYear', () => {
  it('moves the year on, keeps a name without it', () => {
    expect(labelForYear('Noël 2026', 2026, 2027)).toBe('Noël 2027');
    expect(labelForYear('Les enfants', 2026, 2027)).toBe('Les enfants');
  });
});

describe('pastDeed', () => {
  it('says whom I gave to first', () => {
    expect(pastDeed({ gaveTo: ['Zoé'], offered: 3, received: 8 })).toEqual({
      kind: 'gaveTo',
      names: ['Zoé'],
    });
  });

  it('then the gifts I ticked, then those ticked on my lists', () => {
    expect(pastDeed({ gaveTo: [], offered: 3, received: 8 })).toEqual({
      kind: 'offered',
      count: 3,
    });
    expect(pastDeed({ gaveTo: [], offered: 0, received: 8 })).toEqual({
      kind: 'received',
      count: 8,
    });
    expect(pastDeed({ gaveTo: [], offered: 0, received: 0 })).toBeNull();
    expect(pastDeed({ gaveTo: [], offered: 0, received: null })).toBeNull();
  });
});

describe('pastByYear and pastSummary', () => {
  const lines = [
    { year: 2025, date: '2025-12-19', name: 'Bureau' },
    { year: 2026, date: '2026-03-14', name: 'La crémaillère' },
    { year: 2025, date: '2025-12-25', name: 'Famille Camille' },
    { year: 2026, date: '2026-09-12', name: 'Les 6 ans de Léo' },
  ];

  it('groups by year, the latest first, then by date', () => {
    expect(
      pastByYear(lines).map((entry) => [
        entry.year,
        entry.lines.map((line) => line.name),
      ]),
    ).toEqual([
      [2026, ['Les 6 ans de Léo', 'La crémaillère']],
      [2025, ['Famille Camille', 'Bureau']],
    ]);
  });

  it('names the latest and counts the others', () => {
    expect(pastSummary(lines)).toEqual({
      latest: 'Les 6 ans de Léo',
      others: 3,
    });
    expect(pastSummary([])).toBeNull();
  });
});

describe('listIsPast', () => {
  const years = [
    { year: 2025, date: '2025-12-25', santas: [] },
    { year: 2026, date: '2026-12-25', santas: [] },
  ];
  const at = (today: string) => partyTimeline(CHRISTMAS, years, today);
  const of2025 = { eventDate: '2025-12-25', createdAt: '2025-11-01T10:00:00Z' };
  const of2026 = { eventDate: '2026-12-25', createdAt: '2026-11-01T10:00:00Z' };

  it('says a list of last year is over, not the one of this year', () => {
    expect(listIsPast(at('2026-11-22'), of2025)).toBe(true);
    expect(listIsPast(at('2026-11-22'), of2026)).toBe(false);
  });

  it('follows the event leaving the home, not the date alone', () => {
    expect(listIsPast(at('2026-12-28'), of2026)).toBe(false);
    expect(listIsPast(at('2026-12-29'), of2026)).toBe(true);
  });

  it('reads the day it was made without a date', () => {
    expect(
      listIsPast(at('2026-11-22'), {
        eventDate: null,
        createdAt: '2025-10-01T10:00:00Z',
      }),
    ).toBe(true);
  });

  it('says every list of an event over for good is over', () => {
    const wedding = partyTimeline(
      WEDDING,
      [{ year: 2026, date: '2026-06-13', santas: [] }],
      '2026-11-22',
    );
    expect(
      listIsPast(wedding, {
        eventDate: '2026-06-13',
        createdAt: '2026-01-01T10:00:00Z',
      }),
    ).toBe(true);
  });
});

describe('pastBand', () => {
  const timeline = partyTimeline(
    CHRISTMAS,
    [
      { year: 2025, date: '2025-12-25', santas: [] },
      { year: 2026, date: '2026-12-25', santas: [] },
    ],
    '2026-11-22',
  );
  const of2025 = { eventDate: '2025-12-25', createdAt: '2025-11-01T10:00:00Z' };

  it('says nothing on a list of this year', () => {
    expect(
      pastBand(
        timeline,
        { eventDate: '2026-12-25', createdAt: '2026-11-01T10:00:00Z' },
        [],
      ),
    ).toBeNull();
  });

  it('says the year, without a way on when nothing was taken from it', () => {
    expect(pastBand(timeline, of2025, [])).toEqual({ year: 2025, next: null });
  });

  it('leads to the list of this year taken from it, when I may open it', () => {
    expect(
      pastBand(timeline, of2025, [
        { year: 2026, createdAt: '2026-11-02T10:00:00Z', to: '/l/abc' },
      ]),
    ).toEqual({ year: 2025, next: { year: 2026, to: '/l/abc' } });
  });

  it('leads nowhere to a list I may not open, or of another year', () => {
    expect(
      pastBand(timeline, of2025, [
        { year: 2026, createdAt: '2026-11-02T10:00:00Z', to: null },
        { year: 2024, createdAt: '2024-11-02T10:00:00Z', to: '/l/old' },
      ]),
    ).toEqual({ year: 2025, next: null });
  });

  it('takes the latest when several were taken', () => {
    expect(
      pastBand(timeline, of2025, [
        { year: 2026, createdAt: '2026-11-02T10:00:00Z', to: '/l/a' },
        { year: 2026, createdAt: '2026-11-05T10:00:00Z', to: '/listes/b' },
      ])?.next,
    ).toEqual({ year: 2026, to: '/listes/b' });
  });
});

describe('reopensYear (Julien, 25 November 2026)', () => {
  const year = { year: 2026, santas: [{ status: 'preparing' }] };
  const today = '2026-11-25';

  it('lets a date set in the past by mistake be put right', () => {
    expect(reopensYear(year, true, '2026-12-11', today)).toBe(true);
  });

  it('only to a day to come, of the same year, in the latest year', () => {
    expect(reopensYear(year, true, '2026-11-24', today)).toBe(false);
    expect(reopensYear(year, true, '2027-01-10', today)).toBe(false);
    expect(reopensYear(year, false, '2026-12-11', today)).toBe(false);
  });

  it('never once a Secret Santa of that year was drawn', () => {
    expect(
      reopensYear(
        { year: 2026, santas: [{ status: 'drawn' }] },
        true,
        '2026-12-11',
        today,
      ),
    ).toBe(false);
  });
});
