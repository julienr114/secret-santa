/* eslint-disable functional/no-classes, functional/no-class-inheritance, functional/no-this-expressions -- Cloudflare asks for a class: a Durable Object extends DurableObject. Everything it decides is in the pure functions of server/utils/live.ts. */
import { DurableObject } from 'cloudflare:workers';
import {
  applyMessage,
  canJoin,
  isIdle,
  liveSecretOf,
  parseMessage,
  presenceOf,
  seatOf,
  verifyTicket,
  type LiveEvent,
  type Seat,
} from '#server/utils/live';

// The room of a list watched live (lot 26, README 22.20): one Durable
// Object per list, which holds the WebSocket connections of those who
// have it open, with hibernation (asleep between two events, it costs
// nothing). It stores nothing and knows nothing of the list: it says
// « the list changed » when the app tells it so, and tells those who
// hold the list who is there and who writes which line. What each
// connection is (who, since when, the line they write) travels with the
// socket itself, so that it survives the sleep.

/** The path the app calls after a write, from inside the Worker only. */
export const SIGNAL_PATH = '/signal';

export class ListRoom extends DurableObject<Record<string, unknown>> {
  /** The connections, each with its seat. */
  private seats(): { socket: WebSocket; seat: Seat }[] {
    return this.ctx.getWebSockets().flatMap((socket) => {
      const seat = socket.deserializeAttachment() as Seat | null;
      return seat ? [{ socket, seat }] : [];
    });
  }

  private send(socket: WebSocket, event: LiveEvent) {
    try {
      socket.send(JSON.stringify(event));
    } catch {
      // Gone meanwhile: its close will come.
    }
  }

  /** Closes what was left without activity, and returns who stays. */
  private sweep(now: number) {
    return this.seats().filter(({ socket, seat }) => {
      if (!isIdle(seat, now)) return true;
      socket.close(1000, 'idle');
      return false;
    });
  }

  /** Tells those who hold the list who is there, and who writes what. */
  private tellPresence(now: number, without?: WebSocket) {
    const there = this.sweep(now).filter(({ socket }) => socket !== without);
    const presence = presenceOf(
      there.map(({ seat }) => seat),
      now,
    );
    for (const { socket, seat } of there) {
      if (seat.role === 'holder') {
        this.send(socket, { t: 'presence', ...presence });
      }
    }
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const now = Date.now();
    // The app, after a write: everyone reads their own view again.
    if (url.pathname === SIGNAL_PATH && request.method === 'POST') {
      for (const { socket } of this.sweep(now)) {
        this.send(socket, { t: 'changed' });
      }
      return new Response(null, { status: 204 });
    }
    if (request.headers.get('upgrade') !== 'websocket') {
      return new Response(null, { status: 426 });
    }
    const secret = liveSecretOf(this.env);
    const listId = url.pathname.split('/').at(-1) ?? '';
    const who = await verifyTicket(
      url.searchParams.get('ticket'),
      secret,
      listId,
      now,
    );
    if (!who) return new Response(null, { status: 403 });
    if (!canJoin(this.sweep(now).length)) {
      return new Response(null, { status: 503 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(seatOf(who, now));
    this.tellPresence(now);
    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(
    socket: WebSocket,
    raw: string | ArrayBuffer,
  ): Promise<void> {
    const message = parseMessage(raw);
    const seat = socket.deserializeAttachment() as Seat | null;
    // Too big, or not one of ours: this connection has nothing to say.
    if (!message || !seat) {
      socket.close(1009, 'unexpected');
      return;
    }
    const now = Date.now();
    const next = applyMessage(seat, message, now);
    socket.serializeAttachment(next);
    if (next.writing !== seat.writing) this.tellPresence(now);
  }

  override async webSocketClose(socket: WebSocket): Promise<void> {
    this.tellPresence(Date.now(), socket);
  }

  override async webSocketError(socket: WebSocket): Promise<void> {
    this.tellPresence(Date.now(), socket);
  }
}
