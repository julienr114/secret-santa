import type { H3Event } from 'h3';
import { findAccountById } from '#server/database/accounts';
import type { Db } from '#server/database/client';
import { devSignal } from '#server/live/devRooms';
import { avatarOf } from '#server/utils/avatars';
import {
  LIVE,
  liveSecretOf,
  signTicket,
  type LiveRole,
} from '#server/utils/live';

// The app's side of the live lists (lot 26): the ticket a browser needs
// to connect to the room of a list, and the word sent to that room
// after a write.

type Stub = { fetch: (input: string, init?: RequestInit) => Promise<Response> };
type Rooms = {
  idFromName: (name: string) => unknown;
  get: (id: unknown) => Stub;
};

/** The rooms of the Worker; none in development. */
const roomsOf = (event: H3Event): Rooms | null =>
  ((event.context.cloudflare?.env as Record<string, unknown> | undefined)
    ?.LIST_ROOM as Rooms | undefined) ?? null;

/**
 * The secret that signs the tickets, as the room will read it: from the
 * bindings of the Worker, or, in development, from the settings.
 * @param event - The request.
 * @returns The secret.
 */
const secretOf = (event: H3Event): string =>
  liveSecretOf(
    event.context.cloudflare?.env as Record<string, unknown> | undefined,
  ) || String(useRuntimeConfig(event).dataKey ?? '');

/**
 * What a browser needs to watch a list live: where to connect, and a
 * ticket good for a minute that says what it is to the list. Someone who
 * holds the list is named (their first name and icon, for the others who
 * hold it); so is someone who figures on it and writes their own ideas,
 * with the parts where they write; a visitor is not, with or without an
 * account.
 * @param event - The request.
 * @param db - The database.
 * @param listId - The list.
 * @param role - Holds it, or came by its link.
 * @param accountId - The account, when there is one.
 * @param sections - For who figures on the list, the parts they write in.
 * @returns Where to connect and the ticket, or `live: false` where the
 *   rooms do not exist.
 */
export const liveTicket = async (
  event: H3Event,
  db: Db,
  listId: string,
  role: LiveRole,
  accountId: string | null,
  sections: readonly string[] = [],
) => {
  // In development the rooms are in the memory of the server.
  if (!import.meta.dev && !roomsOf(event)) return { live: false as const };
  const account =
    role !== 'visitor' && accountId
      ? await findAccountById(db, accountId)
      : null;
  const ticket = await signTicket(
    {
      listId,
      role,
      accountId: role === 'visitor' ? null : accountId,
      name: account?.firstName ?? account?.email.split('@')[0] ?? '',
      avatar: account ? avatarOf(account) : null,
      ...(role === 'linked' ? { sections } : {}),
      exp: Date.now() + LIVE.ticketMs,
    },
    secretOf(event),
  );
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return { live: true as const, path: `/live/${listId}`, ticket };
};

/**
 * Tells the room of a list that the list changed. Never fails the
 * request that wrote: a room that does not answer only delays what the
 * others see until they come back to the page.
 * @param event - The request that wrote.
 * @param listId - The list.
 * @returns Once told, or given up.
 */
export const signalList = async (event: H3Event, listId: string) => {
  // In development the rooms are in the memory of the server, whatever
  // bindings the development tools pretend to have.
  if (import.meta.dev) {
    devSignal(listId);
    return;
  }
  const rooms = roomsOf(event);
  if (!rooms) return;
  try {
    await rooms
      .get(rooms.idFromName(listId))
      .fetch('https://room/signal', { method: 'POST' });
  } catch {
    // Nothing to do: D1 has the truth.
  }
};

/**
 * Tells several lists at once, after the answer: a person who left every
 * list they were on, an account whose name or icon shows on its lists.
 * @param event - The request that wrote.
 * @param listIds - The lists, each told once.
 */
export const signalLists = (event: H3Event, listIds: readonly string[]) => {
  const once = [...new Set(listIds)];
  event.waitUntil(
    Promise.all(once.map((listId) => signalList(event, listId))).catch(
      () => undefined,
    ),
  );
};
