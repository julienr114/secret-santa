import { describe, expect, it } from 'vitest';
import {
  LIVE,
  applyMessage,
  canJoin,
  isIdle,
  liveTarget,
  parseMessage,
  presenceOf,
  seatOf,
  signTicket,
  verifyTicket,
  type Seat,
} from './live';

const NOW = 1_800_000_000_000;
const camille = {
  role: 'holder' as const,
  accountId: 'camille',
  name: 'Camille',
  avatar: { emoji: '🦌', color: 'plum' } as const,
};
const hugo = {
  role: 'holder' as const,
  accountId: 'hugo',
  name: 'Hugo',
  avatar: { emoji: '🐧', color: 'frost' } as const,
};
const visitor = {
  role: 'visitor' as const,
  accountId: null,
  name: '',
  avatar: null,
};

describe('the ticket to connect', () => {
  const ticket = { ...hugo, listId: 'noel', exp: NOW + LIVE.ticketMs };

  it('is read back by who has the secret, for that list, in time', async () => {
    const text = await signTicket(ticket, 'secret');
    expect(await verifyTicket(text, 'secret', 'noel', NOW)).toEqual(ticket);
  });

  it('opens nothing with another secret, another list, or too late', async () => {
    const text = await signTicket(ticket, 'secret');
    expect(await verifyTicket(text, 'other', 'noel', NOW)).toBeNull();
    expect(await verifyTicket(text, 'secret', 'paques', NOW)).toBeNull();
    expect(
      await verifyTicket(text, 'secret', 'noel', NOW + LIVE.ticketMs),
    ).toBeNull();
    expect(await verifyTicket(text, '', 'noel', NOW)).toBeNull();
  });

  it('cannot be rewritten: a visitor does not make themself a holder', async () => {
    const text = await signTicket({ ...ticket, ...visitor }, 'secret');
    const [, mac] = text.split('.');
    // The body of a holder's ticket, under the signature of the visitor's.
    const [holderBody] = (await signTicket(ticket, 'elsewhere')).split('.');
    const forged = `${holderBody}.${mac}`;
    expect(await verifyTicket(forged, 'secret', 'noel', NOW)).toBeNull();
    for (const junk of [null, '', 'a', 'a.b', 'a.b.c', '.']) {
      expect(await verifyTicket(junk, 'secret', 'noel', NOW)).toBeNull();
    }
  });
});

describe('what bounds a list watched live', () => {
  it('takes 30 connections, not one more', () => {
    expect(canJoin(0)).toBe(true);
    expect(canJoin(LIVE.maxConnections - 1)).toBe(true);
    expect(canJoin(LIVE.maxConnections)).toBe(false);
  });

  it('closes a connection left 30 minutes without activity', () => {
    const seat = seatOf(camille, NOW);
    expect(isIdle(seat, NOW + LIVE.idleMs - 1)).toBe(false);
    expect(isIdle(seat, NOW + LIVE.idleMs)).toBe(true);
    // Any message is activity.
    const active = applyMessage(seat, { t: 'active' }, NOW + LIVE.idleMs - 1);
    expect(isIdle(active, NOW + LIVE.idleMs)).toBe(false);
  });

  it('reads the three small messages, and nothing else', () => {
    expect(parseMessage('{"t":"writing","line":"abc-123"}')).toEqual({
      t: 'writing',
      line: 'abc-123',
    });
    expect(parseMessage('{"t":"idle"}')).toEqual({ t: 'idle' });
    expect(parseMessage('{"t":"active","more":1}')).toEqual({ t: 'active' });
    for (const bad of [
      '{"t":"writing"}',
      '{"t":"writing","line":"<script>"}',
      `{"t":"writing","line":"${'a'.repeat(65)}"}`,
      '{"t":"changed"}',
      'not json',
      `{"t":"idle","pad":"${'x'.repeat(LIVE.maxMessageBytes)}"}`,
      new ArrayBuffer(4),
      null,
    ]) {
      expect(parseMessage(bad)).toBeNull();
    }
  });
});

describe('who writes which line', () => {
  it('locks a line for the one who holds the list and writes it', () => {
    const seat = applyMessage(
      seatOf(hugo, NOW),
      { t: 'writing', line: 'idea-1' },
      NOW + 5,
    );
    expect(seat.writing).toBe('idea-1');
    expect(presenceOf([seat], NOW + 10).writing).toEqual([
      { accountId: 'hugo', name: 'Hugo', avatar: hugo.avatar, line: 'idea-1' },
    ]);
  });

  it('frees it when they validate or leave the line', () => {
    const writing = applyMessage(
      seatOf(hugo, NOW),
      { t: 'writing', line: 'idea-1' },
      NOW,
    );
    const done = applyMessage(writing, { t: 'idle' }, NOW + 1000);
    expect(done.writing).toBeNull();
    expect(presenceOf([done], NOW + 1000).writing).toEqual([]);
  });

  it('frees it after 30 seconds without a key pressed', () => {
    const seat = applyMessage(
      seatOf(hugo, NOW),
      { t: 'writing', line: 'idea-1' },
      NOW,
    );
    expect(presenceOf([seat], NOW + LIVE.lockMs - 1).writing).toHaveLength(1);
    expect(presenceOf([seat], NOW + LIVE.lockMs).writing).toEqual([]);
    // Another key pressed keeps it.
    const again = applyMessage(
      seat,
      { t: 'writing', line: 'idea-1' },
      NOW + LIVE.lockMs - 1,
    );
    expect(presenceOf([again], NOW + LIVE.lockMs).writing).toHaveLength(1);
  });

  it('never says a visitor writes', () => {
    const seat = applyMessage(
      seatOf(visitor, NOW),
      { t: 'writing', line: 'idea-1' },
      NOW + 5,
    );
    expect(seat.writing).toBeNull();
    expect(seat.seenAt).toBe(NOW + 5);
    expect(presenceOf([seat], NOW + 5).writing).toEqual([]);
  });
});

describe('who is there', () => {
  const seats: Seat[] = [
    seatOf(camille, NOW),
    seatOf(hugo, NOW),
    // Hugo has the list open twice: he is there once.
    seatOf(hugo, NOW),
    seatOf(visitor, NOW),
    // A visitor with an account is a visitor all the same.
    seatOf({ ...visitor, accountId: 'mamie', name: 'Mamie' }, NOW),
  ];

  it('names those who hold the list, once each', () => {
    expect(presenceOf(seats, NOW).holders.map((h) => h.name)).toEqual([
      'Camille',
      'Hugo',
    ]);
  });

  it('counts the visitors, and never names them', () => {
    const presence = presenceOf(seats, NOW);
    expect(presence.visitors).toBe(2);
    expect(JSON.stringify(presence)).not.toContain('Mamie');
    expect(JSON.stringify(presence)).not.toContain('mamie');
  });
});

describe('what a write on the app touches', () => {
  it('tells the list written, by its id or by its link', () => {
    expect(liveTarget('POST', '/api/lists/abc/ideas', 201)).toEqual({
      listId: 'abc',
    });
    expect(liveTarget('PATCH', '/api/lists/abc', 200)).toEqual({
      listId: 'abc',
    });
    expect(liveTarget('PUT', '/api/lists/abc/order', 200)).toEqual({
      listId: 'abc',
    });
    expect(liveTarget('DELETE', '/api/lists/abc/claims/i1', 200)).toEqual({
      listId: 'abc',
    });
    expect(liveTarget('POST', '/api/l/tok/claims', 201)).toEqual({
      token: 'tok',
    });
    expect(liveTarget('POST', '/api/l/tok/off-list', 201)).toEqual({
      token: 'tok',
    });
  });

  it('tells nothing of a reading, a refusal, or anything else', () => {
    expect(liveTarget('GET', '/api/lists/abc', 200)).toBeNull();
    expect(liveTarget('POST', '/api/lists/abc/ideas', 409)).toBeNull();
    expect(liveTarget('POST', '/api/lists', 201)).toBeNull();
    expect(liveTarget('POST', '/api/lists/abc/live', 200)).toBeNull();
    expect(liveTarget('POST', '/api/l/tok/live', 200)).toBeNull();
    expect(liveTarget('GET', '/api/l/tok', 200)).toBeNull();
    expect(liveTarget('PATCH', '/api/family/m1', 200)).toBeNull();
    expect(liveTarget('POST', '/api/admin/famille/persons', 201)).toBeNull();
  });
});
