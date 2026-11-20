import type { Avatar } from './avatars';
import { toBase64Url } from './crypto';

// The live lists (lot 26, README 22.20). One Durable Object per list
// holds the WebSocket connections of those who have it open. D1 stays
// the only truth: the object only says « the list changed », and each
// browser reads its own view again by the usual routes, so nothing one
// may not see ever goes through the channel. Two exceptions, between
// those who hold the list only, who see everything of it anyway: who is
// there, and who writes which line, with what they are typing (asked by
// Julien on 20 November 2026: real time means seeing the other write).
// Someone who figures on the list and writes their own ideas by its link
// changes the list too (Julien, the same day): what they write locks
// the line for those who hold the list, and what is written in their
// own part locks it for them. Of who is there they learn nothing.
// Pure: the object (`server/live/room.ts`) only applies what these
// functions decide.

/** What bounds the cost of a list watched live. */
export const LIVE = {
  /** Connections one list keeps open; one more is refused. */
  maxConnections: 30,
  /** Without activity for so long, a connection is closed. */
  idleMs: 30 * 60 * 1000,
  /** Without a key pressed for so long, a line is free again. */
  lockMs: 30 * 1000,
  /** A message bigger than this is refused: none needs more. */
  maxMessageBytes: 2048,
  /** What is being typed, as far as it travels: the longest text of a
   *  list, its word of welcome. */
  maxDraft: 500,
  /** The parts of one list a person who figures on it writes in. */
  maxSections: 8,
  /** How long a ticket to connect is good for. */
  ticketMs: 60 * 1000,
  /** How often a browser asks the room whether it is still there. */
  pingMs: 25 * 1000,
  /** Without an answer for so long, the connection is taken for dead. */
  pongWaitMs: 10 * 1000,
} as const;

/**
 * « Are you there? » and its answer: plain words, not messages of the
 * list. In production the object answers without waking up.
 */
export const PING = 'ping';
export const PONG = 'pong';

/** What someone is to the list they watch. */
export type LiveRole = 'holder' | 'linked' | 'visitor';
/** Who connects: named only when they hold the list. */
export type LiveWho = {
  role: LiveRole;
  accountId: string | null;
  name: string;
  avatar: Avatar | null;
  /** For who figures on the list: the parts where they write. */
  sections?: readonly string[];
};
/** The right to connect to one list, for a minute. */
export type Ticket = LiveWho & { listId: string; exp: number };

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const fromBase64Url = (text: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(
    [...atob(text.replaceAll('-', '+').replaceAll('_', '/'))].map((c) =>
      c.charCodeAt(0),
    ),
  );
const hmacKey = (secret: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(`live:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );

/**
 * A ticket to connect, signed by the app: the route that knows who asks
 * writes it, the object that takes the connection checks it. Nothing
 * secret is in it; nobody can write one without the secret of the app.
 * @param ticket - Who connects, to which list, until when.
 * @param secret - The secret of the app.
 * @returns The ticket, as a text for a URL.
 */
export const signTicket = async (
  ticket: Ticket,
  secret: string,
): Promise<string> => {
  const body = toBase64Url(encoder.encode(JSON.stringify(ticket)));
  const mac = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret, 'sign'),
    encoder.encode(body),
  );
  return `${body}.${toBase64Url(new Uint8Array(mac))}`;
};

/**
 * Reads a ticket: only one signed by the app, for that list, still good.
 * @param text - The ticket given with the connection.
 * @param secret - The secret of the app.
 * @param listId - The list of the object asked.
 * @param now - The time, in milliseconds.
 * @returns Who connects, or null.
 */
export const verifyTicket = async (
  text: string | null | undefined,
  secret: string,
  listId: string,
  now: number,
): Promise<Ticket | null> => {
  const [body, mac, ...rest] = (text ?? '').split('.');
  if (!body || !mac || rest.length > 0 || !secret) return null;
  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret, 'verify'),
      fromBase64Url(mac),
      encoder.encode(body),
    );
    if (!valid) return null;
    const ticket = JSON.parse(decoder.decode(fromBase64Url(body))) as Ticket;
    return ticket.listId === listId && ticket.exp > now ? ticket : null;
  } catch {
    return null;
  }
};

/**
 * The secret that signs the tickets: the key of the app (`NUXT_DATA_KEY`),
 * read from the bindings of the Worker by the route that signs and by the
 * object that checks, so that both always read the same. It only keys a
 * signature here, under a name of its own; it encrypts nothing.
 * @param env - The bindings of the Worker.
 * @returns The secret, empty when there is none (no ticket then opens).
 */
export const liveSecretOf = (
  env: Record<string, unknown> | null | undefined,
): string => String(env?.NUXT_DATA_KEY ?? '');

/** What the object keeps of one connection. */
export type Seat = LiveWho & {
  /** When they were last active, in milliseconds. */
  seenAt: number;
  /** The line they write, what they typed, and when they last pressed a key. */
  writing: string | null;
  /** The part of the list that line is in, when it is in one. */
  section: string | null;
  /** The parts where someone who figures on the list writes. */
  sections: readonly string[];
  draft: string;
  /** Where their caret is in what they typed. */
  caret: number;
  writingAt: number;
};

/**
 * The seat of someone who just connected.
 * @param who - Who they are.
 * @param now - The time.
 * @returns Their seat.
 */
export const seatOf = (who: LiveWho, now: number): Seat => ({
  role: who.role,
  accountId: who.accountId,
  name: who.name,
  avatar: who.avatar,
  seenAt: now,
  writing: null,
  section: null,
  sections: (who.sections ?? []).slice(0, LIVE.maxSections),
  draft: '',
  caret: 0,
  writingAt: 0,
});

/** Whether one more connection fits on a list. */
export const canJoin = (connections: number): boolean =>
  connections < LIVE.maxConnections;

/** What a browser says to the object. */
export type LiveMessage =
  | {
      t: 'writing';
      line: string;
      section: string | null;
      text: string;
      caret: number;
    }
  | { t: 'idle' }
  | { t: 'active' };

const LINE = /^[A-Za-z0-9_:-]{1,64}$/;

/**
 * « I write this line »: what is typed, cut at the length of an idea,
 * and the caret, kept inside it (at its end when not said).
 * @param line - The line.
 * @param section - The part of the list it is in, if any.
 * @param text - What is typed.
 * @param caret - Where the caret is.
 * @returns The message.
 */
const writingOf = (
  line: string,
  section: unknown,
  text: unknown,
  caret: unknown,
): LiveMessage => {
  const typed = typeof text === 'string' ? text.slice(0, LIVE.maxDraft) : '';
  return {
    t: 'writing',
    line,
    section: typeof section === 'string' && LINE.test(section) ? section : null,
    text: typed,
    caret:
      typeof caret === 'number' && Number.isInteger(caret)
        ? Math.max(0, Math.min(typed.length, caret))
        : typed.length,
  };
};

/**
 * Reads what a browser sent: one of the three messages, small, or
 * nothing. Anything else is not answered.
 * @param raw - What came.
 * @returns The message, or null.
 */
export const parseMessage = (raw: unknown): LiveMessage | null => {
  if (typeof raw !== 'string' || raw.length > LIVE.maxMessageBytes) return null;
  try {
    const data = JSON.parse(raw) as {
      t?: unknown;
      line?: unknown;
      section?: unknown;
      text?: unknown;
      caret?: unknown;
    };
    if (data.t === 'idle' || data.t === 'active') return { t: data.t };
    return data.t === 'writing' &&
      typeof data.line === 'string' &&
      LINE.test(data.line)
      ? writingOf(data.line, data.section, data.text, data.caret)
      : null;
  } catch {
    return null;
  }
};

/**
 * A seat after a message. A visitor is never said to write: their
 * « writing » changes nothing but their activity. Someone who figures on
 * the list is, in their own parts only.
 * @param seat - The seat.
 * @param message - What they said.
 * @param now - The time.
 * @returns The seat after.
 */
export const applyMessage = (
  seat: Seat,
  message: LiveMessage,
  now: number,
): Seat => {
  const active = { ...seat, seenAt: now };
  if (seat.role === 'visitor' || message.t === 'active') return active;
  const may =
    message.t === 'writing' &&
    (seat.role === 'holder' ||
      (message.section !== null && seat.sections.includes(message.section)));
  return message.t === 'writing' && may
    ? {
        ...active,
        writing: message.line,
        section: message.section,
        draft: message.text,
        caret: message.caret,
        writingAt: now,
      }
    : {
        ...active,
        writing: null,
        section: null,
        draft: '',
        caret: 0,
        writingAt: 0,
      };
};

/** Whether a connection was left without activity for too long. */
export const isIdle = (seat: Seat, now: number): boolean =>
  now - seat.seenAt >= LIVE.idleMs;

/** One of those who hold the list, there now. */
export type LivePerson = {
  accountId: string;
  name: string;
  avatar: Avatar | null;
};
/** What those who hold a list learn of who watches it. */
export type Presence = {
  /** Those who hold the list and have it open, once each. */
  holders: LivePerson[];
  /** How many have it open by its link: a number, never who. */
  visitors: number;
  /** The lines being written, by whom, what they typed, their caret. */
  writing: (LivePerson & {
    line: string;
    section: string | null;
    text: string;
    caret: number;
  })[];
};

/**
 * What those who hold a list are told of who is there: the others who
 * hold it, how many visitors, and which lines are being written (a line
 * nobody typed in for 30 seconds is free again). Visitors are counted,
 * never named, and never said to write; someone who figures on the list
 * is counted with them, and named only on the line they write.
 * @param seats - Every connection of the list.
 * @param now - The time.
 * @returns The presence.
 */
export const presenceOf = (seats: readonly Seat[], now: number): Presence => {
  const people = seats.flatMap((seat) =>
    seat.role !== 'visitor' && seat.accountId
      ? [{ ...seat, accountId: seat.accountId }]
      : [],
  );
  const person = (seat: (typeof people)[number]): LivePerson => ({
    accountId: seat.accountId,
    name: seat.name,
    avatar: seat.avatar,
  });
  return {
    holders: people
      .filter((seat) => seat.role === 'holder')
      .filter(
        (seat, index, holders) =>
          holders.findIndex((one) => one.accountId === seat.accountId) ===
          index,
      )
      .map(person),
    visitors: seats.filter((seat) => seat.role !== 'holder').length,
    writing: people.flatMap((seat) =>
      seat.writing && now - seat.writingAt < LIVE.lockMs
        ? [
            {
              ...person(seat),
              line: seat.writing,
              section: seat.section,
              text: seat.draft,
              caret: seat.caret,
            },
          ]
        : [],
    ),
  };
};

/**
 * What someone who figures on the list learns of it: nobody who is
 * there, no count, and only the lines of their own parts that someone
 * else writes.
 * @param seat - Their seat.
 * @param presence - What those who hold the list are told.
 * @returns What they are told.
 */
export const presenceForLinked = (
  seat: Seat,
  presence: Presence,
): Presence => ({
  holders: [],
  visitors: 0,
  writing: presence.writing.filter(
    (one) =>
      one.section !== null &&
      seat.sections.includes(one.section) &&
      one.accountId !== seat.accountId,
  ),
});

/** What the object sends: the list changed, or who is there. */
export type LiveEvent = { t: 'changed' } | ({ t: 'presence' } & Presence);

/**
 * What a write on the app touches: a list, named by its id or by the
 * token of its link. Only a write that went through.
 * @param method - The HTTP method.
 * @param path - The path, without its query.
 * @param status - The status of the answer.
 * @returns The list to tell, or null.
 */
export const liveTarget = (
  method: string,
  path: string,
  status: number,
): { listId: string } | { token: string } | { memberId: string } | null => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    return null;
  }
  if (status >= 400) return null;
  const held = /^\/api\/lists\/([^/]+)(\/.*)?$/.exec(path);
  // Asking for a ticket changes nothing.
  if (held?.[1]) return held[2] === '/live' ? null : { listId: held[1] };
  // The page of one of my people: their name, icon and sizes show on
  // every list they are on.
  const member = /^\/api\/family\/([^/]+)$/.exec(path);
  if (member?.[1]) return { memberId: member[1] };
  const linked = /^\/api\/l\/([^/]+)\/(.+)$/.exec(path);
  return linked?.[1] && linked[2] !== 'live' ? { token: linked[1] } : null;
};

// --- The room, whatever holds its connections ---------------------------

/** One connection, as the room sees it: a way to write to it, its seat. */
export type Peer = {
  send: (text: string) => void;
  close: (code: number, reason: string) => void;
  seat: () => Seat | null;
  sit: (seat: Seat) => void;
};

const tell = (peer: Peer, event: LiveEvent) => {
  try {
    peer.send(JSON.stringify(event));
  } catch {
    // Gone meanwhile: its close will come.
  }
};

/**
 * Closes what was left without activity, and says who stays.
 * @param peers - The connections of the room.
 * @param now - The time.
 * @returns Those still there, each with its seat.
 */
export const roomSweep = (peers: readonly Peer[], now: number) =>
  peers.flatMap((peer) => {
    const seat = peer.seat();
    if (!seat) return [];
    if (!isIdle(seat, now)) return [{ peer, seat }];
    peer.close(1000, 'idle');
    return [];
  });

/**
 * Tells those who hold the list who is there, and who writes what.
 * @param peers - The connections of the room.
 * @param now - The time.
 * @param without - A connection that is leaving.
 */
export const roomPresence = (
  peers: readonly Peer[],
  now: number,
  without?: Peer,
) => {
  const there = roomSweep(peers, now).filter(({ peer }) => peer !== without);
  const presence = presenceOf(
    there.map(({ seat }) => seat),
    now,
  );
  there.forEach(({ peer, seat }) => {
    if (seat.role === 'holder') tell(peer, { t: 'presence', ...presence });
    if (seat.role === 'linked') {
      tell(peer, { t: 'presence', ...presenceForLinked(seat, presence) });
    }
  });
};

/**
 * The list changed: everyone reads their own view again.
 * @param peers - The connections of the room.
 * @param now - The time.
 */
export const roomSignal = (peers: readonly Peer[], now: number) => {
  roomSweep(peers, now).forEach(({ peer }) => tell(peer, { t: 'changed' }));
};

/**
 * Something came from a connection: one of the three small messages
 * changes its seat, anything else closes it.
 * @param peers - The connections of the room, this one among them.
 * @param peer - The connection that spoke.
 * @param raw - What it sent.
 * @param now - The time.
 */
export const roomMessage = (
  peers: readonly Peer[],
  peer: Peer,
  raw: unknown,
  now: number,
) => {
  const message = parseMessage(raw);
  const seat = peer.seat();
  if (!message || !seat) {
    peer.close(1009, 'unexpected');
    return;
  }
  const next = applyMessage(seat, message, now);
  peer.sit(next);
  if (
    next.writing !== seat.writing ||
    next.section !== seat.section ||
    next.draft !== seat.draft ||
    next.caret !== seat.caret
  ) {
    roomPresence(peers, now);
  }
};
