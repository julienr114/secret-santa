// @ts-expect-error Nitro's own entry has no types of its own to import.
import handler from 'nitropack/presets/cloudflare/runtime/cloudflare-module';

// The entry of the Worker (lot 26): Nitro's own, plus the Durable Object
// of the live lists and the one request Nitro cannot answer, the
// WebSocket connection to a list's room. That connection goes straight
// to the object, which checks the ticket the app signed: nothing here
// knows who may watch which list.
export { ListRoom } from './room';

type Stub = { fetch: (request: Request) => Promise<Response> };
type Rooms = {
  idFromName: (name: string) => unknown;
  get: (id: unknown) => Stub;
};
type Handler = {
  fetch: (
    request: Request,
    env: Record<string, unknown>,
    context: unknown,
  ) => Promise<Response>;
};

/** `/live/{listId}`, asked as a WebSocket. */
const LIVE_PATH = /^\/live\/([A-Za-z0-9_-]{1,64})$/;

export default {
  ...handler,
  async fetch(
    request: Request,
    env: Record<string, unknown>,
    context: unknown,
  ): Promise<Response> {
    const listId = LIVE_PATH.exec(new URL(request.url).pathname)?.[1];
    if (listId && request.headers.get('upgrade') === 'websocket') {
      const rooms = env.LIST_ROOM as Rooms | undefined;
      if (!rooms) return new Response(null, { status: 503 });
      return rooms.get(rooms.idFromName(listId)).fetch(request);
    }
    return (handler as Handler).fetch(request, env, context);
  },
};
