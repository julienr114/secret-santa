import {
  roomMessage,
  roomPresence,
  roomSignal,
  roomSweep,
  type Peer,
  type Seat,
} from '#server/utils/live';

// The rooms of the live lists in development (`pnpm dev`), where Nitro
// runs on Node and Cloudflare's Durable Object does not exist: the same
// room, kept in the memory of the development server. Never used in
// production, where `server/live/room.ts` holds the connections.

/** What the development server gives for a connection. */
export type DevSocket = {
  send: (text: string) => void;
  close: (code?: number, reason?: string) => void;
};

const rooms = new Map<string, Map<DevSocket, Seat>>();

const roomOf = (listId: string) => {
  const room = rooms.get(listId) ?? new Map<DevSocket, Seat>();
  rooms.set(listId, room);
  return room;
};
const peersOf = (listId: string): { socket: DevSocket; peer: Peer }[] => {
  const room = roomOf(listId);
  return [...room.keys()].map((socket) => ({
    socket,
    peer: {
      send: (text) => socket.send(text),
      close: (code, reason) => {
        room.delete(socket);
        socket.close(code, reason);
      },
      seat: () => room.get(socket) ?? null,
      sit: (seat) => {
        room.set(socket, seat);
      },
    },
  }));
};
const all = (listId: string) => peersOf(listId).map(({ peer }) => peer);

/** How many are connected to a list. */
export const devCount = (listId: string): number =>
  roomSweep(all(listId), Date.now()).length;

/** Someone connected. */
export const devJoin = (listId: string, socket: DevSocket, seat: Seat) => {
  roomOf(listId).set(socket, seat);
  roomPresence(all(listId), Date.now());
};

/** Someone said something. */
export const devMessage = (listId: string, socket: DevSocket, raw: unknown) => {
  const peers = peersOf(listId);
  const mine = peers.find((one) => one.socket === socket);
  if (!mine) return;
  roomMessage(
    peers.map(({ peer }) => peer),
    mine.peer,
    raw,
    Date.now(),
  );
};

/** Someone left. */
export const devLeave = (listId: string, socket: DevSocket) => {
  roomOf(listId).delete(socket);
  roomPresence(all(listId), Date.now());
};

/** The list changed. */
export const devSignal = (listId: string) =>
  roomSignal(all(listId), Date.now());
