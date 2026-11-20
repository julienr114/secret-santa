import type { InjectionKey, Ref } from 'vue';
import { useQueryClient, type QueryKey } from '@tanstack/vue-query';
import {
  LIVE,
  PING,
  PONG,
  type LiveEvent,
  type LivePerson,
  type Presence,
} from '#server/utils/live';
import { api } from '~/composables/queries/useApi';

// A list watched live (lot 26, README 22.20). The browser asks the app
// for a ticket, then keeps one WebSocket open to the room of the list.
// The room only says « the list changed »: the page then reads its own
// view again by its usual route, so that nothing it may not see ever
// comes through the channel. Those who hold the list also learn who is
// there and who writes which line. Without a connection nothing breaks:
// the page reads again when it comes back to the front.

/** What a line of the document needs of the live list. */
export type ListLive = {
  /** Who else holds the list and has it open, and how many visitors. */
  presence: Readonly<Ref<Presence | null>>;
  /** Who else writes that line now, with what they typed so far. */
  writingBy: (
    line: string,
    section?: string,
  ) => (LivePerson & { text: string; caret: number }) | null;
  /** I write that line: what I typed so far, where my caret is, and the
   *  part of the list the line is in, when it is in one. */
  writing: (
    line: string,
    text: string,
    caret: number,
    section?: string,
  ) => void;
  /** I left the line, or validated it. */
  idle: () => void;
};
export const LIST_LIVE: InjectionKey<ListLive> = Symbol('list-live');

/** The live list, as a line sees it; null where there is none. */
export const useListLiveLine = (): ListLive | null => inject(LIST_LIVE, null);

/** How long between two tries after a connection lost, at most. */
const RETRY_MS = [2000, 5000, 15_000, 60_000];
/** What I type is said at most this often: the others see it grow. */
const WRITING_EVERY_MS = 200;
/** « I am still here » is said at most this often. */
const ACTIVE_EVERY_MS = 5 * 60 * 1000;

type TicketAnswer =
  { live: false } | { live: true; path: string; ticket: string };

/**
 * Keeps a list live while its page is open.
 * @param ticketUrl - The route that gives the ticket to connect.
 * @param refetch - The queries to read again when the list changed.
 * @param myAccountId - My account, to leave myself out of who is there.
 * @returns What to provide to the lines, and who is there.
 */
export const useListLive = (
  ticketUrl: () => string,
  refetch: () => readonly QueryKey[],
  myAccountId: () => string | null = () => null,
): ListLive => {
  const queryClient = useQueryClient();
  const presence = ref<Presence | null>(null);
  const state: {
    socket: WebSocket | null;
    tries: number;
    retry: number;
    lastActive: number;
    saidActive: number;
    saidWriting: number;
    /** The line I write now, said again when the connection comes back. */
    line: string | null;
    section: string | null;
    text: string;
    caret: number;
    sendTimer: number;
    lockTimer: number;
    watch: number;
    /** The questions « are you there? », and the wait for their answer. */
    ping: number;
    pong: number;
    /** Connected once already: the next connection is a return. */
    wasOpen: boolean;
    left: boolean;
  } = {
    socket: null,
    tries: 0,
    retry: 0,
    lastActive: Date.now(),
    saidActive: Date.now(),
    saidWriting: 0,
    line: null,
    section: null,
    text: '',
    caret: 0,
    sendTimer: 0,
    lockTimer: 0,
    watch: 0,
    ping: 0,
    pong: 0,
    wasOpen: false,
    left: false,
  };

  const reload = () =>
    Promise.all(
      refetch().map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  /**
   * Says something to the room.
   * @param message - What to say.
   * @returns False when there is no connection to say it on.
   */
  const say = (
    message:
      | {
          t: 'writing';
          line: string;
          section: string | null;
          text: string;
          caret: number;
        }
      | { t: 'idle' | 'active' },
  ): boolean => {
    if (state.socket?.readyState !== WebSocket.OPEN) return false;
    state.socket.send(JSON.stringify(message));
    return true;
  };
  const close = () => {
    window.clearTimeout(state.retry);
    window.clearTimeout(state.pong);
    state.socket?.close(1000);
    state.socket = null;
    presence.value = null;
  };

  const connect = async () => {
    if (state.left || state.socket || document.hidden) return;
    const answer = await api<TicketAnswer>(ticketUrl(), {
      method: 'POST',
    }).catch(() => null);
    // No room (development), or no right to the list: nothing live.
    if (!answer?.live || state.left || state.socket) return;
    const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(
      `${scheme}//${window.location.host}${answer.path}?ticket=${encodeURIComponent(answer.ticket)}`,
    );
    state.socket = socket;
    socket.addEventListener('open', () => {
      state.tries = 0;
      // Back after a cut: what changed meanwhile was never told.
      if (state.wasOpen) void reload();
      state.wasOpen = true;
      // What I was writing while the connection was away is said now.
      if (
        state.line &&
        say({
          t: 'writing',
          line: state.line,
          section: state.section,
          text: state.text,
          caret: state.caret,
        })
      ) {
        state.saidWriting = Date.now();
      }
    });
    socket.addEventListener('message', (event) => {
      // The room is there.
      if (event.data === PONG) {
        window.clearTimeout(state.pong);
        return;
      }
      const data = JSON.parse(String(event.data)) as LiveEvent;
      if (data.t === 'changed') void reload();
      else presence.value = data;
    });
    socket.addEventListener('close', () => {
      if (state.socket !== socket) return;
      window.clearTimeout(state.pong);
      state.socket = null;
      presence.value = null;
      if (state.left || document.hidden) return;
      // Try again, less and less often.
      const wait =
        RETRY_MS[Math.min(state.tries, RETRY_MS.length - 1)] ?? 60_000;
      state.tries += 1;
      state.retry = window.setTimeout(() => void connect(), wait);
    });
  };

  /** Something was touched or typed: I am still here. */
  const onActivity = () => {
    const now = Date.now();
    state.lastActive = now;
    if (!state.socket) {
      // Closed for lack of activity: back, and up to date.
      void reload();
      void connect();
      return;
    }
    if (now - state.saidActive >= ACTIVE_EVERY_MS) {
      state.saidActive = now;
      say({ t: 'active' });
    }
  };
  /** Back to the front, or back online: read again, connect again. */
  const onBack = () => {
    if (document.hidden) return;
    void reload();
    void connect();
  };

  onMounted(() => {
    void connect();
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('online', onBack);
    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity, { passive: true });
    // A connection can die without saying so (a phone asleep, a network
    // gone): the room is asked now and then whether it is there, and a
    // connection that does not answer is dropped, then made again.
    state.ping = window.setInterval(() => {
      const socket = state.socket;
      if (socket?.readyState !== WebSocket.OPEN) return;
      socket.send(PING);
      window.clearTimeout(state.pong);
      state.pong = window.setTimeout(() => {
        if (state.socket === socket) socket.close();
      }, LIVE.pongWaitMs);
    }, LIVE.pingMs);
    // Left open without touching anything for 30 minutes: closed.
    state.watch = window.setInterval(() => {
      if (state.socket && Date.now() - state.lastActive >= LIVE.idleMs) close();
    }, 60_000);
  });
  onBeforeUnmount(() => {
    state.left = true;
    window.clearInterval(state.watch);
    window.clearInterval(state.ping);
    window.clearTimeout(state.lockTimer);
    window.clearTimeout(state.sendTimer);
    document.removeEventListener('visibilitychange', onBack);
    window.removeEventListener('online', onBack);
    window.removeEventListener('pointerdown', onActivity);
    window.removeEventListener('keydown', onActivity);
    close();
  });

  const idle = () => {
    window.clearTimeout(state.lockTimer);
    window.clearTimeout(state.sendTimer);
    state.saidWriting = 0;
    state.line = null;
    state.section = null;
    state.text = '';
    say({ t: 'idle' });
  };
  const live: ListLive = {
    presence,
    // A line said to be in a part of the list is locked there only:
    // someone who figures on the list cannot lock anything else.
    writingBy: (line, section) =>
      presence.value?.writing.find(
        (one) =>
          one.line === line &&
          one.accountId !== myAccountId() &&
          (one.section === null || one.section === section),
      ) ?? null,
    writing: (line, text, caret, section) => {
      // Free again after 30 seconds without a key.
      window.clearTimeout(state.lockTimer);
      state.lockTimer = window.setTimeout(idle, LIVE.lockMs);
      const same = state.line === line;
      state.line = line;
      state.section = section ?? null;
      state.text = text;
      state.caret = caret;
      const send = () => {
        window.clearTimeout(state.sendTimer);
        // Kept for the connection to come, when not said.
        if (
          state.line &&
          say({
            t: 'writing',
            line: state.line,
            section: state.section,
            text: state.text,
            caret: state.caret,
          })
        ) {
          state.saidWriting = Date.now();
        }
      };
      const wait = WRITING_EVERY_MS - (Date.now() - state.saidWriting);
      if (!same || wait <= 0) return send();
      // Typed fast: the last letters go once the pause is over.
      window.clearTimeout(state.sendTimer);
      state.sendTimer = window.setTimeout(send, wait);
    },
    idle,
  };
  provide(LIST_LIVE, live);
  return live;
};
