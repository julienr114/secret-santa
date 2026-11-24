import { describe, expect, it } from 'vitest';
import {
  forgetBefore,
  groupNews,
  isForgotten,
  listSection,
  newsSections,
  newsWhen,
  NEWS_SHAPE,
  type NewNews,
} from './news';

const NOW = '2026-11-22T10:00:00.000Z';

const news = (over: Partial<NewNews> = {}): NewNews => ({
  accountId: 'hugo',
  kind: 'ticked',
  targetId: 'list-1',
  partyId: null,
  name: null,
  detail: null,
  ...over,
});

describe('groupNews', () => {
  it('adds a news, counting several of the same kind at the same place', () => {
    expect(
      groupNews([], [news(), news(), news({ accountId: 'ines' })], NOW),
    ).toEqual({
      counted: [],
      added: [
        { ...news(), count: 2 },
        { ...news({ accountId: 'ines' }), count: 1 },
      ],
    });
  });

  it('counts again one not seen of the same day', () => {
    expect(
      groupNews(
        [
          {
            id: 'n1',
            accountId: 'hugo',
            kind: 'ticked',
            targetId: 'list-1',
            count: 2,
            createdAt: '2026-11-22T08:40:00.000Z',
          },
        ],
        [news()],
        NOW,
      ),
    ).toEqual({ counted: [{ id: 'n1', count: 3 }], added: [] });
  });

  it('writes a new one the next day, or elsewhere, or of another kind', () => {
    const pending = [
      {
        id: 'n1',
        accountId: 'hugo',
        kind: 'ticked' as const,
        targetId: 'list-1',
        count: 2,
        createdAt: '2026-11-21T18:00:00.000Z',
      },
    ];
    expect(groupNews(pending, [news()], NOW).added).toHaveLength(1);
    expect(
      groupNews(
        [{ ...pending[0]!, createdAt: NOW }],
        [news({ targetId: 'list-2' }), news({ kind: 'new_ideas' })],
        NOW,
      ).added,
    ).toHaveLength(2);
  });
});

describe('the shape of a news', () => {
  it('is urgent for the envelope, a request for ideas, an invitation, the reminder', () => {
    expect(
      Object.entries(NEWS_SHAPE)
        .filter(([, shape]) => shape.level === 'urgent')
        .map(([kind]) => kind),
    ).toEqual(['envelope', 'hint_request', 'list_invite', 'reminder']);
  });

  it('is seen by opening the thing it points at', () => {
    expect(NEWS_SHAPE.hint_request.target).toBe('santa');
    expect(NEWS_SHAPE.ticked.target).toBe('list');
    expect(NEWS_SHAPE.palmares.target).toBe('game');
  });
});

describe('forgetting thirty days after it was seen', () => {
  it('keeps a news seen 29 days ago, forgets it at 30', () => {
    expect(isForgotten('2026-10-24T10:00:00.000Z', NOW)).toBe(false);
    expect(isForgotten('2026-10-23T10:00:00.000Z', NOW)).toBe(true);
    expect(forgetBefore(NOW)).toBe('2026-10-23T10:00:00.000Z');
  });

  it('never forgets a news not seen yet (ticket 142)', () => {
    expect(isForgotten(null, NOW)).toBe(false);
  });
});

describe('newsWhen', () => {
  it('says today and yesterday with the time, a weekday within a week, a date before', () => {
    expect(newsWhen('2026-11-22T09:12:00.000Z', NOW, 'UTC')).toEqual({
      day: 'today',
      time: '2026-11-22T09:12:00.000Z',
    });
    expect(newsWhen('2026-11-21T18:02:00.000Z', NOW, 'UTC').day).toBe(
      'yesterday',
    );
    // 18 November 2026 is a Wednesday.
    expect(newsWhen('2026-11-18T08:00:00.000Z', NOW, 'UTC')).toEqual({
      day: 'weekday',
      weekday: 3,
    });
    expect(newsWhen('2026-11-10T08:00:00.000Z', NOW, 'UTC')).toEqual({
      day: 'date',
      date: '2026-11-10',
    });
  });

  it('reads the day where the reader is', () => {
    expect(newsWhen('2026-11-21T23:30:00.000Z', NOW, 'Europe/Paris').day).toBe(
      'today',
    );
  });
});

describe('newsSections', () => {
  it('puts the event with the latest news on top, the latest first in each', () => {
    const sections = newsSections([
      { id: 'a', section: 'bureau', at: '2026-11-16T08:00:00.000Z' },
      { id: 'b', section: 'famille', at: '2026-11-22T09:12:00.000Z' },
      { id: 'c', section: 'famille', at: '2026-11-21T18:02:00.000Z' },
      { id: 'd', section: 'mamie', at: '2026-11-21T14:30:00.000Z' },
    ]);
    expect(
      sections.map((s) => [s.section, s.news.map((one) => one.id)]),
    ).toEqual([
      ['famille', ['b', 'c']],
      ['mamie', ['d']],
      ['bureau', ['a']],
    ]);
  });
});

describe('listSection', () => {
  it('takes the event of the list whose date is the nearest to come', () => {
    expect(
      listSection(
        [
          { partyId: 'famille', date: '2026-12-25' },
          { partyId: 'mamie', date: '2026-12-24' },
        ],
        '2026-11-22',
      ),
    ).toBe('mamie');
  });

  it('takes the latest when all are past, none when I am in none', () => {
    expect(
      listSection(
        [
          { partyId: 'a', date: '2026-11-01' },
          { partyId: 'b', date: '2026-11-10' },
        ],
        '2026-11-22',
      ),
    ).toBe('b');
    expect(listSection([], '2026-11-22')).toBeNull();
  });
});
