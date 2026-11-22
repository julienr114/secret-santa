import { describe, expect, it } from 'vitest';
import { drawListOrder, type DrawListCandidate } from './drawLists';

const christmas = { id: 'famille', category: 'christmas' as const };
const list = (
  id: string,
  events: DrawListCandidate['events'],
  updatedAt: string,
): DrawListCandidate => ({ id, events, updatedAt });

describe('the list for my Secret Santa', () => {
  it('chooses the list of the same event first', () => {
    expect(
      drawListOrder(christmas, [
        list(
          'mamie',
          [{ id: 'mamie', category: 'christmas' }],
          '2026-11-21T10:00:00Z',
        ),
        list('old', [christmas], '2026-10-01T10:00:00Z'),
      ]),
    ).toEqual(['old', 'mamie']);
  });

  it('else one of the same category, else the most recent', () => {
    expect(
      drawListOrder(christmas, [
        list(
          'birthday',
          [{ id: 'leo', category: 'birthday' }],
          '2026-11-21T10:00:00Z',
        ),
        list(
          'mamie',
          [{ id: 'mamie', category: 'christmas' }],
          '2026-11-01T10:00:00Z',
        ),
        list('nowhere', [], '2026-11-22T10:00:00Z'),
      ]),
    ).toEqual(['mamie', 'nowhere', 'birthday']);
    expect(drawListOrder(christmas, [])).toEqual([]);
  });
});
