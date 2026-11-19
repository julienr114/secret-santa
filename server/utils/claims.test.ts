import { describe, expect, it } from 'vitest';
import {
  canChange,
  canTick,
  leaderAfterLeaving,
  newIdeasSince,
  offListView,
  type ClaimRow,
} from './claims';

const row = (over: Partial<ClaimRow>): ClaimRow => ({
  accountId: 'a',
  mode: 'alone',
  anonymous: false,
  note: null,
  closed: false,
  createdAt: '2026-11-18T10:00:00Z',
  ...over,
});

describe('claims', () => {
  it('ticks a free idea, joins an open group, and refuses the rest', () => {
    expect(canTick([], 'b')).toEqual({ ok: true, value: 'alone' });
    expect(canTick([row({})], 'b')).toMatchObject({ reason: 'taken' });
    expect(canTick([row({ mode: 'group' })], 'b')).toEqual({
      ok: true,
      value: 'join',
    });
    expect(canTick([row({ mode: 'group', closed: true })], 'b')).toMatchObject({
      reason: 'taken',
    });
    expect(canTick([row({})], 'a')).toMatchObject({
      reason: 'conflict',
    });
  });

  it('switches alone and with others only while nobody else is on it', () => {
    expect(canChange([row({})], 'a', { mode: 'group' }).ok).toBe(true);
    const group = [
      row({ mode: 'group' }),
      row({ accountId: 'b', mode: 'group', createdAt: '2026-11-19' }),
    ];
    expect(canChange(group, 'a', { mode: 'alone' })).toMatchObject({
      reason: 'conflict',
    });
    expect(canChange(group, 'b', { note: 'J’en suis.' }).ok).toBe(true);
    expect(canChange([], 'a', { note: 'x' })).toMatchObject({
      reason: 'not_found',
    });
  });

  it('lets only the one who leads a group close it', () => {
    const group = [
      row({ mode: 'group' }),
      row({ accountId: 'b', mode: 'group', createdAt: '2026-11-19' }),
    ];
    expect(canChange(group, 'a', { closed: true }).ok).toBe(true);
    expect(canChange(group, 'b', { closed: true })).toMatchObject({
      reason: 'forbidden',
    });
    expect(canChange([row({})], 'a', { closed: true })).toMatchObject({
      reason: 'forbidden',
    });
  });

  it('hands a group to the next one, and frees a line left alone', () => {
    const group = [
      row({ accountId: 'c', mode: 'group', createdAt: '2026-11-20' }),
      row({ mode: 'group' }),
      row({ accountId: 'b', mode: 'group', createdAt: '2026-11-19' }),
    ];
    expect(leaderAfterLeaving(group, 'a')).toBe('b');
    expect(leaderAfterLeaving([row({})], 'a')).toBeNull();
  });

  it('shows a gift off the list to the holder, a surprise to the others', () => {
    const gift = {
      accountId: 'a',
      text: 'un jeu de société',
      anonymous: false,
      name: 'Tonton',
    };
    expect(offListView(gift, { accountId: 'a', holds: false })).toEqual({
      kind: 'mine',
      text: 'un jeu de société',
    });
    expect(offListView(gift, { accountId: 'h', holds: true })).toEqual({
      kind: 'holder',
      text: 'un jeu de société',
      by: 'Tonton',
    });
    expect(
      offListView(
        { ...gift, anonymous: true },
        { accountId: 'h', holds: true },
      ),
    ).toMatchObject({ by: null });
    expect(offListView(gift, { accountId: null, holds: false })).toEqual({
      kind: 'surprise',
    });
  });

  it('counts the ideas written since the last visit', () => {
    const ideas = [
      { createdAt: '2026-11-10' },
      { createdAt: '2026-11-15' },
      { createdAt: '2026-11-16' },
    ];
    expect(newIdeasSince(ideas, '2026-11-12')).toBe(2);
    expect(newIdeasSince(ideas, null)).toBe(0);
  });
});
