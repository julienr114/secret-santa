import { describe, expect, it } from 'vitest';
import {
  appNotes,
  isoOfSqlite,
  noteFor,
  V3_NOTE_ID,
  type AppNoteRule,
} from './appNote';

const SWITCHED = '2026-12-01T06:00:00.000Z';
const NOTES = appNotes(SWITCHED);
const OLD = { createdAt: '2025-11-20T10:00:00.000Z', heldLinkList: false };

describe('appNotes', () => {
  it('has no word before the V3 is out', () => {
    expect(appNotes(null)).toEqual([]);
  });

  it('has the word of the switch for the accounts created before it', () => {
    expect(NOTES).toEqual([
      {
        id: V3_NOTE_ID,
        key: 'news.note.v3',
        createdBefore: SWITCHED,
        linkKey: 'news.note.v3Link',
      },
    ]);
  });
});

describe('noteFor', () => {
  it('shows a word to the accounts it concerns', () => {
    expect(noteFor(OLD, [], NOTES)).toEqual({
      id: 'v3',
      key: 'news.note.v3',
      extraKey: null,
    });
  });

  it('adds its sentence for those who held a list shared by link', () => {
    expect(noteFor({ ...OLD, heldLinkList: true }, [], NOTES)?.extraKey).toBe(
      'news.note.v3Link',
    );
  });

  it('not to an account created after, nor once closed', () => {
    expect(
      noteFor(
        { createdAt: '2026-12-02T10:00:00.000Z', heldLinkList: true },
        [],
        NOTES,
      ),
    ).toBeNull();
    expect(noteFor(OLD, ['v3'], NOTES)).toBeNull();
  });

  it('shows a word for everyone, and none while the app has none', () => {
    const all: AppNoteRule = { ...NOTES[0]!, createdBefore: null };
    expect(noteFor(OLD, [], [all])?.id).toBe('v3');
    expect(noteFor(OLD, [], [])).toBeNull();
  });
});

describe('isoOfSqlite', () => {
  it('reads the date SQLite writes as an instant of the app', () => {
    expect(isoOfSqlite('2026-11-23 06:02:11')).toBe('2026-11-23T06:02:11.000Z');
    expect(isoOfSqlite(undefined)).toBeNull();
    expect(isoOfSqlite('hier')).toBeNull();
  });
});
