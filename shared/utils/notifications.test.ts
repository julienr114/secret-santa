import { describe, expect, it } from 'vitest';
import { newsTag, staleNotifications } from './notifications';

describe('the notifications of the phone (ticket 175)', () => {
  it('tags a notification with its news', () => {
    expect(newsTag('n1')).toBe('news-n1');
  });

  it('takes away those whose news is seen, keeps those still waiting', () => {
    expect(
      staleNotifications(['news-n1', 'news-n2', 'news-n3'], ['n2']),
    ).toEqual(['news-n1', 'news-n3']);
  });

  it('takes away all once nothing waits, and those of an older tag', () => {
    expect(staleNotifications(['news-n1', '/p/abc'], [])).toEqual([
      'news-n1',
      '/p/abc',
    ]);
    expect(staleNotifications([], ['n1'])).toEqual([]);
  });
});
