/* eslint-disable functional/no-classes, functional/no-class-inheritance, functional/no-this-expressions -- Cloudflare asks for a class: a Durable Object extends DurableObject. Everything it decides is in the pure functions of server/utils/live.ts. */
import { DurableObject } from 'cloudflare:workers';
import {
  canJoin,
  liveSecretOf,
  roomMessage,
  roomPresence,
  roomSignal,
  roomSweep,
  seatOf,
  verifyTicket,
  type Peer,
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

/** A socket of the object, as the room sees a connection. */
const peerOf = (socket: WebSocket): Peer => ({
  send: (text) => socket.send(text),
  close: (code, reason) => socket.close(code, reason),
  seat: () => socket.deserializeAttachment() as Seat | null,
  sit: (seat) => socket.serializeAttachment(seat),
});

export class ListRoom extends DurableObject<Record<string, unknown>> {
  private peers(): Peer[] {
    return this.ctx.getWebSockets().map(peerOf);
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const now = Date.now();
    // The app, after a write: everyone reads their own view again.
    if (url.pathname === SIGNAL_PATH && request.method === 'POST') {
      roomSignal(this.peers(), now);
      return new Response(null, { status: 204 });
    }
    if (request.headers.get('upgrade') !== 'websocket') {
      return new Response(null, { status: 426 });
    }
    const who = await verifyTicket(
      url.searchParams.get('ticket'),
      liveSecretOf(this.env),
      url.pathname.split('/').at(-1) ?? '',
      now,
    );
    if (!who) return new Response(null, { status: 403 });
    if (!canJoin(roomSweep(this.peers(), now).length)) {
      return new Response(null, { status: 503 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(seatOf(who, now));
    roomPresence(this.peers(), now);
    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(
    socket: WebSocket,
    raw: string | ArrayBuffer,
  ): Promise<void> {
    const peers = this.ctx.getWebSockets();
    const all = peers.map(peerOf);
    roomMessage(
      all,
      all[peers.indexOf(socket)] ?? peerOf(socket),
      raw,
      Date.now(),
    );
  }

  override async webSocketClose(socket: WebSocket): Promise<void> {
    this.leave(socket);
  }

  override async webSocketError(socket: WebSocket): Promise<void> {
    this.leave(socket);
  }

  /** Someone left: the others who hold the list are told. */
  private leave(socket: WebSocket) {
    const peers = this.ctx.getWebSockets();
    const all = peers.map(peerOf);
    roomPresence(all, Date.now(), all[peers.indexOf(socket)]);
  }
}
