import {
  devCount,
  devJoin,
  devLeave,
  devMessage,
  type DevSocket,
} from '#server/live/devRooms';
import { PING, PONG, canJoin, seatOf, verifyTicket } from '#server/utils/live';

// The WebSocket of a list's room, in development only (`pnpm dev`): the
// same ticket, the same bounds, the same messages as the Durable Object
// of production, kept in the memory of the development server. In
// production this address never comes here: the Worker's entry sends it
// straight to the object (`server/live/entry.ts`).

const listOf = (url: string) =>
  new URL(url, 'http://dev').pathname.split('/').at(-1) ?? '';
const secret = () => String(useRuntimeConfig().dataKey ?? '');

export default defineWebSocketHandler({
  async upgrade(request) {
    if (!import.meta.dev) return new Response(null, { status: 404 });
    const url = new URL(request.url, 'http://dev');
    const listId = listOf(request.url);
    const who = await verifyTicket(
      url.searchParams.get('ticket'),
      secret(),
      listId,
      Date.now(),
    );
    if (!who) return new Response(null, { status: 403 });
    if (!canJoin(devCount(listId))) return new Response(null, { status: 503 });
    return undefined;
  },
  async open(peer) {
    const url = new URL(peer.request?.url ?? '', 'http://dev');
    const listId = listOf(url.pathname);
    const who = await verifyTicket(
      url.searchParams.get('ticket'),
      secret(),
      listId,
      Date.now(),
    );
    if (!who) return peer.close(4403, 'ticket');
    devJoin(listId, peer as unknown as DevSocket, seatOf(who, Date.now()));
  },
  message(peer, message) {
    // « Are you there? », which the object of production answers itself.
    if (message.text() === PING) {
      peer.send(PONG);
      return;
    }
    devMessage(
      listOf(peer.request?.url ?? ''),
      peer as unknown as DevSocket,
      message.text(),
    );
  },
  close(peer) {
    devLeave(listOf(peer.request?.url ?? ''), peer as unknown as DevSocket);
  },
  error(peer) {
    devLeave(listOf(peer.request?.url ?? ''), peer as unknown as DevSocket);
  },
});
