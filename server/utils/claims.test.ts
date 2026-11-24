import { describe, expect, it } from 'vitest';
import {
  accountKey,
  giversPlan,
  ideaWho,
  listCandidates,
  sameGivers,
  sameWritten,
  ticksToLink,
  writtenKey,
  type WhoClaim,
  mayRemoveClaim,
  removableClaims,
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

describe('unticking for someone (Correction 25)', () => {
  const row = (
    id: string,
    accountId: string,
    over: Partial<{ anonymous: boolean; mode: 'alone' | 'group' }> = {},
  ) => ({
    id,
    accountId,
    name: accountId,
    mode: 'alone' as const,
    anonymous: false,
    note: null,
    closed: false,
    createdAt: `2026-11-12T10:00:0${id}.000Z`,
    ...over,
  });

  it('lets those who hold the list take any tick off, the others their own', () => {
    const mamies = { accountId: 'mamie' };
    expect(mayRemoveClaim({ accountId: 'camille', holds: true }, mamies)).toBe(
      true,
    );
    expect(mayRemoveClaim({ accountId: 'tonton', holds: false }, mamies)).toBe(
      false,
    );
    expect(mayRemoveClaim({ accountId: 'mamie', holds: false }, mamies)).toBe(
      true,
    );
    expect(mayRemoveClaim({ accountId: null, holds: false }, mamies)).toBe(
      false,
    );
  });

  it('offers the ticks of the others to those who hold the list only', () => {
    const claims = [row('1', 'mamie'), row('2', 'camille')];
    expect(
      removableClaims(claims, { accountId: 'camille', holds: true }),
    ).toEqual([{ id: '1', by: 'mamie', at: '2026-11-12T10:00:01.000Z' }]);
    expect(
      removableClaims(claims, { accountId: 'tonton', holds: false }),
    ).toEqual([]);
    expect(removableClaims(claims, { accountId: null, holds: false })).toEqual(
      [],
    );
  });

  it('keeps the secret of an anonymous tick: neither name nor date', () => {
    expect(
      removableClaims([row('1', 'mamie', { anonymous: true })], {
        accountId: 'camille',
        holds: true,
      }),
    ).toEqual([{ id: '1', by: null, at: null }]);
  });

  it('offers each one of a gift given by several', () => {
    const claims = [
      row('1', 'mamie', { mode: 'group' }),
      row('2', 'camille', { mode: 'group' }),
      row('3', 'hugo', { mode: 'group' }),
    ];
    expect(
      removableClaims(claims, { accountId: 'camille', holds: true }).map(
        (claim) => claim.by,
      ),
    ).toEqual(['mamie', 'hugo']);
  });
});

const who = (over: Partial<WhoClaim>): WhoClaim => ({
  ...row({}),
  id: 'c1',
  key: 'a:a',
  name: 'Mamie',
  notedBy: null,
  notedByName: null,
  ...over,
});

describe('cocher pour quelqu’un', () => {
  const holder = { accountId: 'me', holds: true };

  it('opens the sheet for those who hold the list only, never on an anonymous tick', () => {
    expect(ideaWho([who({})], { accountId: 'b', holds: false })).toBeNull();
    expect(ideaWho([], holder)).toBeNull();
    expect(ideaWho([who({ anonymous: true })], holder)).toBeNull();
    expect(
      ideaWho(
        [
          who({ mode: 'group' }),
          who({ id: 'c2', key: 'a:x', anonymous: true }),
        ],
        holder,
      ),
    ).toBeNull();
  });

  it('says who ticked, who noted, who proposed, and when', () => {
    expect(ideaWho([who({})], holder)).toEqual({
      keys: ['a:a'],
      mode: 'alone',
      closed: false,
      trace: { kind: 'ticked', by: 'Mamie', at: '2026-11-18T10:00:00Z' },
    });
    expect(
      ideaWho([who({ key: 'a:me', name: 'Camille' })], holder)?.trace,
    ).toMatchObject({ kind: 'ticked', by: null });
    expect(
      ideaWho([who({ notedBy: 'me', notedByName: 'Camille' })], holder)?.trace,
    ).toMatchObject({ kind: 'noted', by: null });
    expect(
      ideaWho([who({ notedBy: 'h', notedByName: 'Hugo' })], holder)?.trace,
    ).toMatchObject({ kind: 'noted', by: 'Hugo' });
    const group = ideaWho(
      [
        who({
          id: 'c2',
          key: 'g:t',
          name: 'Tata',
          mode: 'group',
          createdAt: '2026-11-19',
        }),
        who({ mode: 'group', closed: true }),
      ],
      holder,
    );
    expect(group).toMatchObject({
      keys: ['a:a', 'g:t'],
      mode: 'group',
      closed: true,
      trace: { kind: 'proposed', by: 'Mamie' },
    });
  });

  it('offers me, those who hold the list, those who ticked, the members of its events, the names written, once each', () => {
    const candidates = listCandidates({
      viewer: { accountId: 'me', name: 'Camille', avatar: null },
      holders: [
        {
          accountId: 'me',
          name: 'Camille',
          avatar: { emoji: '🦌', color: 'brick' },
        },
        {
          accountId: 'h',
          name: 'Hugo',
          avatar: { emoji: '🐧', color: 'brick' },
        },
      ],
      claims: [
        who({ key: 'a:h', name: 'Hugo', createdAt: '2026-11-10' }),
        who({ id: 'c2', key: 'a:t', name: 'Tonton', createdAt: '2026-11-12' }),
        who({ id: 'c3', key: 'a:m', name: 'Mamie', createdAt: '2026-11-11' }),
        who({ id: 'c4', key: 'a:x', name: 'Secret', anonymous: true }),
        who({ id: 'c5', key: 'g:p', name: 'Parrain' }),
        who({ id: 'c6', key: 'a:m', name: 'Mamie', createdAt: '2026-11-13' }),
      ],
      members: [
        {
          accountId: 'm',
          name: 'Mamie',
          avatar: { emoji: '🦌', color: 'brick' },
        },
        { accountId: 'z', name: 'Zoé', avatar: { emoji: '🦊', color: 'pine' } },
        {
          accountId: 'h',
          name: 'Hugo',
          avatar: { emoji: '🐧', color: 'brick' },
        },
      ],
      written: [
        { id: 't', name: 'Tata', email: null },
        { id: 'p', name: 'Parrain', email: 'parrain@example.com' },
      ],
    });
    expect(candidates.map((c) => [c.key, c.kind])).toEqual([
      ['a:me', 'me'],
      ['a:h', 'holder'],
      ['a:m', 'ticker'],
      ['a:t', 'ticker'],
      ['a:z', 'member'],
      ['g:t', 'written'],
      ['g:p', 'written'],
    ]);
    expect(candidates.at(-1)?.email).toBe('parrain@example.com');
  });

  it('puts someone in my place, alone', () => {
    expect(giversPlan([who({ key: 'a:me' })], ['a:m'], 'alone')).toEqual({
      ok: true,
      value: { remove: ['c1'], keep: [], add: ['a:m'], leader: 'a:m' },
    });
  });

  it('keeps the place of who stays in a gift given by several, and adds the others after', () => {
    const current = [
      who({ id: 'c2', key: 'a:t', mode: 'group', createdAt: '2026-11-19' }),
      who({ key: 'a:m', mode: 'group' }),
    ];
    expect(giversPlan(current, ['g:p', 'a:t', 'g:p'], 'group')).toEqual({
      ok: true,
      value: { remove: ['c1'], keep: ['c2'], add: ['g:p'], leader: 'a:t' },
    });
  });

  it('refuses nobody, several for one person, and an anonymous tick', () => {
    expect(giversPlan([who({})], [], 'alone')).toMatchObject({
      reason: 'empty',
    });
    expect(giversPlan([], ['a:a', 'a:b'], 'alone')).toMatchObject({
      reason: 'several',
    });
    expect(
      giversPlan([who({ anonymous: true })], ['a:me'], 'alone'),
    ).toMatchObject({ reason: 'anonymous' });
  });

  it('sees when someone ticked or unticked while the sheet was open', () => {
    expect(sameGivers([{ key: 'a:a' }], ['a:a'])).toBe(true);
    expect(sameGivers([], [])).toBe(true);
    expect(sameGivers([{ key: 'a:a' }], [])).toBe(false);
    expect(sameGivers([{ key: 'a:a' }], ['a:b'])).toBe(false);
  });

  it('finds a first name already written, by its name and its address', () => {
    const written = [
      { id: 't', name: 'Tata', email: null },
      { id: 'p', name: 'Parrain', email: 'p@example.com' },
    ];
    expect(sameWritten(written, { name: ' tata ', email: null })?.id).toBe('t');
    expect(
      sameWritten(written, { name: 'Tata', email: 't@example.com' }),
    ).toBeUndefined();
    expect(
      sameWritten(written, { name: 'Parrain', email: 'p@example.com' })?.id,
    ).toBe('p');
  });

  it('gives an account the ticks kept for its address, unless it already gives the idea', () => {
    const waiting = [
      { id: '1', ideaId: 'velo' },
      { id: '2', ideaId: 'livre' },
      { id: '3', ideaId: 'velo' },
    ];
    expect(ticksToLink(waiting, new Set(['livre']))).toEqual({
      take: [{ id: '1', ideaId: 'velo' }],
      drop: [
        { id: '2', ideaId: 'livre' },
        { id: '3', ideaId: 'velo' },
      ],
    });
  });

  it('names accounts and first names apart', () => {
    expect(accountKey('x')).toBe('a:x');
    expect(writtenKey('x')).toBe('g:x');
  });
});
