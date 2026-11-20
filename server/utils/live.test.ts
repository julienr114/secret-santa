import { describe, expect, it } from 'vitest';
import {
  LIVE,
  applyMessage,
  canJoin,
  isIdle,
  liveTarget,
  parseMessage,
  presenceOf,
  roomMessage,
  roomPresence,
  roomSignal,
  roomSweep,
  seatOf,
  signTicket,
  verifyTicket,
  type Peer,
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
      text: '',
      caret: 0,
    });
    // What is typed travels, cut at the longest text of a list.
    expect(
      parseMessage(
        JSON.stringify({
          t: 'writing',
          line: 'new:p1',
          text: 'x'.repeat(LIVE.maxDraft + 100),
        }),
      ),
    ).toEqual({
      t: 'writing',
      line: 'new:p1',
      text: 'x'.repeat(LIVE.maxDraft),
      caret: LIVE.maxDraft,
    });
    // The caret travels too, kept inside what is typed.
    expect(
      parseMessage('{"t":"writing","line":"i","text":"abc","caret":1}'),
    ).toMatchObject({ caret: 1 });
    expect(
      parseMessage('{"t":"writing","line":"i","text":"abc","caret":99}'),
    ).toMatchObject({ caret: 3 });
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
      {
        t: 'writing',
        line: 'idea-1',
        text: 'Un télescope pour enf',
        caret: 21,
      },
      NOW + 5,
    );
    expect(seat.writing).toBe('idea-1');
    expect(presenceOf([seat], NOW + 10).writing).toEqual([
      {
        accountId: 'hugo',
        name: 'Hugo',
        avatar: hugo.avatar,
        line: 'idea-1',
        text: 'Un télescope pour enf',
        caret: 21,
      },
    ]);
  });

  it('frees it when they validate or leave the line', () => {
    const writing = applyMessage(
      seatOf(hugo, NOW),
      {
        t: 'writing',
        line: 'idea-1',
        text: 'Un télescope pour enf',
        caret: 21,
      },
      NOW,
    );
    const done = applyMessage(writing, { t: 'idle' }, NOW + 1000);
    expect(done.writing).toBeNull();
    expect(presenceOf([done], NOW + 1000).writing).toEqual([]);
  });

  it('frees it after 30 seconds without a key pressed', () => {
    const seat = applyMessage(
      seatOf(hugo, NOW),
      {
        t: 'writing',
        line: 'idea-1',
        text: 'Un télescope pour enf',
        caret: 21,
      },
      NOW,
    );
    expect(presenceOf([seat], NOW + LIVE.lockMs - 1).writing).toHaveLength(1);
    expect(presenceOf([seat], NOW + LIVE.lockMs).writing).toEqual([]);
    // Another key pressed keeps it.
    const again = applyMessage(
      seat,
      {
        t: 'writing',
        line: 'idea-1',
        text: 'Un télescope pour enf',
        caret: 21,
      },
      NOW + LIVE.lockMs - 1,
    );
    expect(presenceOf([again], NOW + LIVE.lockMs).writing).toHaveLength(1);
  });

  it('never says a visitor writes', () => {
    const seat = applyMessage(
      seatOf(visitor, NOW),
      {
        t: 'writing',
        line: 'idea-1',
        text: 'Un télescope pour enf',
        caret: 21,
      },
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

  it('tells every list of one of my people when their page changes', () => {
    expect(liveTarget('PATCH', '/api/family/m1', 200)).toEqual({
      memberId: 'm1',
    });
    expect(liveTarget('GET', '/api/family/m1', 200)).toBeNull();
    expect(liveTarget('POST', '/api/family', 201)).toBeNull();
  });

  it('tells nothing of a reading, a refusal, or anything else', () => {
    expect(liveTarget('GET', '/api/lists/abc', 200)).toBeNull();
    expect(liveTarget('POST', '/api/lists/abc/ideas', 409)).toBeNull();
    expect(liveTarget('POST', '/api/lists', 201)).toBeNull();
    expect(liveTarget('POST', '/api/lists/abc/live', 200)).toBeNull();
    expect(liveTarget('POST', '/api/l/tok/live', 200)).toBeNull();
    expect(liveTarget('GET', '/api/l/tok', 200)).toBeNull();
    expect(liveTarget('POST', '/api/admin/famille/persons', 201)).toBeNull();
  });
});

describe('the room', () => {
  const peerOf = (who: Parameters<typeof seatOf>[0]) => {
    const box: { seat: Seat | null; got: string[]; closed: string | null } = {
      seat: seatOf(who, NOW),
      got: [],
      closed: null,
    };
    const peer: Peer = {
      send: (text) => {
        box.got = [...box.got, text];
      },
      close: (_code, reason) => {
        box.closed = reason;
        box.seat = null;
      },
      seat: () => box.seat,
      sit: (seat) => {
        box.seat = seat;
      },
    };
    return { peer, box };
  };

  it('tells everyone the list changed, and nothing else to a visitor', () => {
    const a = peerOf(camille);
    const v = peerOf(visitor);
    roomSignal([a.peer, v.peer], NOW);
    expect(a.box.got).toEqual(['{"t":"changed"}']);
    expect(v.box.got).toEqual(['{"t":"changed"}']);
    roomPresence([a.peer, v.peer], NOW);
    expect(a.box.got).toHaveLength(2);
    expect(v.box.got).toHaveLength(1);
  });

  it('shows those who hold the list what the other types, as it comes', () => {
    const a = peerOf(camille);
    const h = peerOf(hugo);
    const v = peerOf(visitor);
    const peers = [a.peer, h.peer, v.peer];
    roomMessage(
      peers,
      h.peer,
      '{"t":"writing","line":"new:leo","text":"Un tél"}',
      NOW + 1,
    );
    roomMessage(
      peers,
      h.peer,
      '{"t":"writing","line":"new:leo","text":"Un télescope"}',
      NOW + 2,
    );
    const last = JSON.parse(a.box.got.at(-1) ?? '{}');
    expect(a.box.got).toHaveLength(2);
    expect(last.writing).toEqual([
      {
        accountId: 'hugo',
        name: 'Hugo',
        avatar: hugo.avatar,
        line: 'new:leo',
        text: 'Un télescope',
        caret: 12,
      },
    ]);
    // Never to a visitor.
    expect(v.box.got).toEqual([]);
    // The same again says nothing new.
    roomMessage(
      peers,
      h.peer,
      '{"t":"writing","line":"new:leo","text":"Un télescope"}',
      NOW + 3,
    );
    expect(a.box.got).toHaveLength(2);
  });

  it('closes a connection that says anything else, or stayed idle', () => {
    const a = peerOf(camille);
    roomMessage([a.peer], a.peer, '{"t":"hack"}', NOW);
    expect(a.box.closed).toBe('unexpected');
    const b = peerOf(hugo);
    expect(roomSweep([b.peer], NOW + LIVE.idleMs)).toEqual([]);
    expect(b.box.closed).toBe('idle');
  });

  it('leaves out the one who is going', () => {
    const a = peerOf(camille);
    const h = peerOf(hugo);
    roomPresence([a.peer, h.peer], NOW, h.peer);
    expect(JSON.parse(a.box.got[0] ?? '{}').holders).toEqual([
      { accountId: 'camille', name: 'Camille', avatar: camille.avatar },
    ]);
    expect(h.box.got).toEqual([]);
  });
});
