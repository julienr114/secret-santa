import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  essentialEvents,
  groupEvents,
  journalDays,
  type JournalLike,
} from './journal';

/** The day of a moment, in UTC: enough for tests. */
const dayOf = (iso: string) => iso.slice(0, 10);

/** An entry, with an id to find it again. */
const entry = (
  id: string,
  type: string,
  createdAt: string,
  editionId: string | null = 'e1',
) => ({ id, type, createdAt, editionId });

const ids = (lines: ReturnType<typeof groupEvents<ReturnType<typeof entry>>>) =>
  lines.map((line) =>
    line.kind === 'one' ? line.entry.id : line.entries.map((e) => e.id),
  );

describe('essentialEvents', () => {
  it('leaves out the changes of icon and of language, keeping the order', () => {
    const entries = [
      entry('a', 'result_viewed', '2026-11-14T23:50:00Z'),
      entry('b', 'avatar_changed', '2026-11-14T21:58:00Z'),
      entry('c', 'language_changed', '2026-11-14T21:00:00Z'),
      entry('d', 'draw_done', '2026-11-14T20:00:00Z'),
    ];
    expect(essentialEvents(entries).map((e) => e.id)).toEqual(['a', 'd']);
  });
});

describe('groupEvents', () => {
  it('folds the views of a day into one line, where the newest is', () => {
    const entries = [
      entry('v3', 'result_viewed', '2026-11-14T23:50:00Z'),
      entry('icon', 'avatar_changed', '2026-11-14T21:58:00Z'),
      entry('v2', 'result_viewed', '2026-11-14T21:52:00Z'),
      entry('v1', 'result_viewed', '2026-11-14T21:40:00Z'),
      entry('draw', 'draw_done', '2026-11-14T21:26:00Z'),
    ];
    expect(ids(groupEvents(entries, dayOf))).toEqual([
      ['v3', 'v2', 'v1'],
      'icon',
      'draw',
    ]);
  });

  it('keeps an event alone when it is the only one of its kind that day', () => {
    const entries = [
      entry('v2', 'result_viewed', '2026-11-15T09:00:00Z'),
      entry('v1', 'result_viewed', '2026-11-14T21:40:00Z'),
    ];
    expect(ids(groupEvents(entries, dayOf))).toEqual(['v2', 'v1']);
  });

  it('never folds events of different editions, or kinds that matter alone', () => {
    const entries = [
      entry('s2', 'message_sent', '2026-11-14T21:31:00Z', 'e2'),
      entry('s1', 'message_sent', '2026-11-14T21:30:00Z', 'e1'),
      entry('r2', 'result_revealed', '2026-11-14T14:03:00Z'),
      entry('r1', 'result_revealed', '2026-11-14T14:02:00Z'),
    ];
    expect(ids(groupEvents(entries, dayOf))).toEqual(['s2', 's1', 'r2', 'r1']);
  });

  it('keeps every event exactly once, in order', () => {
    const types = ['result_viewed', 'message_sent', 'draw_done', 'link_copied'];
    const arbitrary = fc
      .array(
        fc.record({
          type: fc.constantFrom(...types),
          minute: fc.integer({ min: 0, max: 60 * 24 * 3 - 1 }),
        }),
        { maxLength: 40 },
      )
      .map((raw) =>
        raw
          .map((r, i) =>
            entry(
              String(i),
              r.type,
              new Date(
                Date.UTC(2026, 10, 14) + r.minute * 60_000,
              ).toISOString(),
            ),
          )
          .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    fc.assert(
      fc.property(arbitrary, (entries: ReturnType<typeof entry>[]) => {
        const flat = groupEvents(entries, dayOf).flatMap((line) =>
          line.kind === 'one' ? [line.entry] : line.entries,
        );
        expect(flat.map((e) => e.id).toSorted()).toEqual(
          entries.map((e) => e.id).toSorted(),
        );
      }),
    );
  });
});

describe('journalDays', () => {
  it('puts each line under the day of its newest event', () => {
    const entries: JournalLike[] = [
      entry('a', 'rules_changed', '2026-11-15T13:56:00Z'),
      entry('b', 'result_viewed', '2026-11-14T23:50:00Z'),
      entry('c', 'result_viewed', '2026-11-14T21:40:00Z'),
      entry('d', 'draw_done', '2026-11-14T21:26:00Z'),
    ];
    const days = journalDays(groupEvents(entries, dayOf), dayOf);
    expect(days.map((d) => [d.day, d.lines.length])).toEqual([
      ['2026-11-15', 1],
      ['2026-11-14', 2],
    ]);
  });

  it('has no day without a line', () => {
    expect(journalDays([], dayOf)).toEqual([]);
  });
});
