import { describe, expect, it } from 'vitest';
import { APP_NOTES, noteFor, type AppNoteRule } from './appNote';

const SWITCH: AppNoteRule = {
  id: 'v3',
  key: 'news.note.v3',
  createdBefore: '2026-12-01T00:00:00.000Z',
};
const OLD = { createdAt: '2025-11-20T10:00:00.000Z' };

describe('noteFor', () => {
  it('shows a word to the accounts it concerns', () => {
    expect(noteFor(OLD, [], [SWITCH])).toEqual({
      id: 'v3',
      key: 'news.note.v3',
    });
  });

  it('not to an account created after, nor once closed', () => {
    expect(
      noteFor({ createdAt: '2026-12-02T10:00:00.000Z' }, [], [SWITCH]),
    ).toBeNull();
    expect(noteFor(OLD, ['v3'], [SWITCH])).toBeNull();
  });

  it('shows a word for everyone, and none while the app has none', () => {
    expect(noteFor(OLD, [], [{ ...SWITCH, createdBefore: null }])?.id).toBe(
      'v3',
    );
    expect(APP_NOTES).toEqual([]);
    expect(noteFor(OLD, [])).toBeNull();
  });
});
