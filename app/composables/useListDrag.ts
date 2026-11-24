import type { InjectionKey, Ref } from 'vue';

// Reordering a gift list by dragging (lot 24 ter, README 22.20), written
// by hand, without a library: on a phone a long press lifts a line, on a
// computer a handle is pulled. The document marks what moves in its
// markup, and this reads it back:
//   [data-drag-section][data-drag-id]  a person's section;
//   [data-drag="person"][data-drag-id] its header, lifted by a long press;
//   [data-drag="idea"][data-drag-id]   an idea's line;
//   [data-drag-stay]                   on it, someone gives it: it stays
//                                      with its person.
// Nothing is saved from here: the screen is told what was lifted, where
// it would fall, and where it was dropped.

/** What is being moved. */
export type Lifted = { kind: 'idea' | 'person'; id: string };
/** Where it would fall: a place among the others, itself left out. */
export type DropPlace =
  | { kind: 'idea'; personId: string; index: number }
  | { kind: 'person'; index: number };

/** What a line of the document needs to know of the dragging. */
export type ListDrag = {
  lifted: Readonly<Ref<Lifted | null>>;
  drop: Readonly<Ref<DropPlace | null>>;
  /**
   * The handle of a line, pressed with the mouse (ticket 152): it lifts
   * once the mouse moves with the button down; let go before, it was a
   * click, which opens the menu.
   */
  grab: (event: MouseEvent, what: Lifted) => void;
  /** `Alt` + an arrow in a line, « Monter » and « Descendre » in a menu. */
  step: (what: Lifted, step: -1 | 1) => void;
};

export const LIST_DRAG: InjectionKey<ListDrag> = Symbol('list-drag');

/**
 * The dragging, as a line sees it; null where nothing moves (a list
 * opened by its link).
 * @returns What is lifted and where it would fall, or null.
 */
export const useListDragging = (): ListDrag | null => inject(LIST_DRAG, null);

/** How long a finger stays before a line lifts. */
const LONG_PRESS_MS = 350;
/** How far a finger may slip during that time and still lift. */
const SLIP_PX = 10;
/** How far the mouse moves, button down on a handle, before it lifts. */
const PULL_PX = 4;
/** How far past the list a line may go before it is given up. */
const OUTSIDE_PX = 48;
/** How close to an edge of the screen the page starts to scroll. */
const EDGE_PX = 72;

const middle = (el: Element) => {
  const box = el.getBoundingClientRect();
  return box.top + box.height / 2;
};

/**
 * The dragging of a list, on its board (the element that holds every
 * person's section).
 * @param board - The element that holds the sections.
 * @param on - What the screen does of it.
 * @param on.drop - Something was dropped at a place.
 * @param on.step - Something moves one step, from the keyboard or a menu.
 * @returns What to provide to the lines, and where the finger is.
 */
export const useListDrag = (
  board: Ref<HTMLElement | null>,
  on: {
    drop: (what: Lifted, place: DropPlace) => void;
    step: (what: Lifted, step: -1 | 1) => void;
  },
) => {
  const lifted = ref<Lifted | null>(null);
  const drop = ref<DropPlace | null>(null);
  /** Where the finger or the mouse is, on the screen. */
  const pointer = ref({ x: 0, y: 0 });
  /** A finger is down on a line, not lifted yet. */
  const press = ref<{ x: number; y: number; timer: number } | null>(null);
  /** The frame that scrolls the page near an edge. */
  const frame = ref(0);
  /** The mouse just let go of a line: the click of that release is no tap. */
  const swallowClick = ref(false);

  /**
   * Where what is lifted would fall, from where the pointer is.
   * @returns The place, or null out of the list.
   */
  const placeAt = (): DropPlace | null => {
    const root = board.value;
    const what = lifted.value;
    if (!root || !what) return null;
    const y = pointer.value.y;
    const bounds = root.getBoundingClientRect();
    if (y < bounds.top - OUTSIDE_PX || y > bounds.bottom + OUTSIDE_PX) {
      return null;
    }
    const sections = [
      ...root.querySelectorAll<HTMLElement>('[data-drag-section]'),
    ];
    if (what.kind === 'person') {
      const others = sections.filter((s) => s.dataset.dragId !== what.id);
      return {
        kind: 'person',
        index: others.filter((section) => middle(section) < y).length,
      };
    }
    // The section the pointer is in, or the nearest one; its own for an
    // idea someone gives.
    const row = root.querySelector<HTMLElement>(
      `[data-drag="idea"][data-drag-id="${what.id}"]`,
    );
    const own = row?.hasAttribute('data-drag-stay')
      ? row.closest<HTMLElement>('[data-drag-section]')
      : null;
    const section = (own ? [own] : sections)
      .map((el) => {
        const box = el.getBoundingClientRect();
        const away = y < box.top ? box.top - y : Math.max(0, y - box.bottom);
        return { el, away };
      })
      .toSorted((a, b) => a.away - b.away)[0]?.el;
    if (!section?.dataset.dragId) return null;
    const rows = [
      ...section.querySelectorAll<HTMLElement>('[data-drag="idea"]'),
    ].filter((row) => row.dataset.dragId !== what.id);
    return {
      kind: 'idea',
      personId: section.dataset.dragId,
      index: rows.filter((row) => middle(row) < y).length,
    };
  };

  /** Scrolls the page while the pointer is near an edge of the screen. */
  const scrollNearEdges = () => {
    if (!lifted.value) return;
    const y = pointer.value.y;
    const top = EDGE_PX + 56;
    const bottom = window.innerHeight - EDGE_PX - 64;
    const speed = y < top ? (y - top) / 6 : y > bottom ? (y - bottom) / 6 : 0;
    if (speed !== 0) {
      window.scrollBy(0, Math.max(-18, Math.min(18, speed)));
      drop.value = placeAt();
    }
    frame.value = window.requestAnimationFrame(scrollNearEdges);
  };

  const lift = (what: Lifted, at: { x: number; y: number }) => {
    lifted.value = what;
    pointer.value = at;
    drop.value = placeAt();
    frame.value = window.requestAnimationFrame(scrollNearEdges);
  };
  const moveTo = (at: { x: number; y: number }) => {
    pointer.value = at;
    drop.value = placeAt();
  };
  /**
   * Ends the dragging: dropped where it would fall, or given up.
   * @param keep - False gives up: everything stays in place.
   */
  const end = (keep: boolean) => {
    const what = lifted.value;
    const place = drop.value;
    window.cancelAnimationFrame(frame.value);
    lifted.value = null;
    drop.value = null;
    if (!what) return;
    if (keep && place) on.drop(what, place);
  };

  const cancelPress = () => {
    if (press.value) window.clearTimeout(press.value.timer);
    press.value = null;
  };
  /**
   * What a touch would lift: an idea by its line, a person by their
   * header; nothing from a field being written, nor from the menu.
   * @param target - What the finger is on.
   * @returns What to lift, or null.
   */
  const liftable = (target: EventTarget | null): Lifted | null => {
    if (!(target instanceof Element)) return null;
    if (target.closest('textarea, input, [data-no-drag]')) return null;
    const el = target.closest<HTMLElement>('[data-drag]');
    const kind = el?.dataset.drag;
    const id = el?.dataset.dragId;
    return id && (kind === 'idea' || kind === 'person') ? { kind, id } : null;
  };

  const onTouchStart = (event: TouchEvent) => {
    cancelPress();
    const touch = event.touches[0];
    const what = event.touches.length === 1 ? liftable(event.target) : null;
    if (!touch || !what || lifted.value) return;
    const at = { x: touch.clientX, y: touch.clientY };
    press.value = {
      ...at,
      timer: window.setTimeout(() => {
        press.value = null;
        // A short buzz, where the phone has one.
        if (typeof navigator.vibrate === 'function') navigator.vibrate(12);
        lift(what, at);
      }, LONG_PRESS_MS),
    };
  };
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    if (lifted.value) {
      // Lifted: the finger moves the line, the page no longer scrolls.
      if (event.cancelable) event.preventDefault();
      moveTo({ x: touch.clientX, y: touch.clientY });
      return;
    }
    // Not lifted yet: a finger that slips is scrolling the page.
    const start = press.value;
    if (
      start &&
      Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > SLIP_PX
    ) {
      cancelPress();
    }
  };
  const onTouchEnd = (event: TouchEvent) => {
    cancelPress();
    if (!lifted.value) return;
    // No tap follows: the keyboard does not open, nothing is ticked.
    if (event.cancelable) event.preventDefault();
    end(event.type === 'touchend');
  };
  /** The menu of the browser on a long press: not while a line lifts. */
  const onContextMenu = (event: Event) => {
    if (press.value || lifted.value) event.preventDefault();
  };
  /** The click that ends a drag with the mouse is not a tap. */
  const onClickCapture = (event: Event) => {
    if (!swallowClick.value) return;
    swallowClick.value = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const onMouseMove = (event: MouseEvent) =>
    moveTo({ x: event.clientX, y: event.clientY });
  const stopMouse = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  const onMouseUp = () => {
    stopMouse();
    // The click the browser sends after this release is not a tap. (A
    // finger needs no such care: its release is cancelled, no click
    // follows, and a quick tap right after a drop must go through.)
    if (lifted.value) {
      swallowClick.value = true;
      // That click comes at once, before any timer: a later one is real.
      window.setTimeout(() => {
        swallowClick.value = false;
      }, 0);
    }
    end(true);
  };
  /** The mouse is down on a handle, not moved yet. */
  const held = ref<{ x: number; y: number; what: Lifted } | null>(null);
  const onHeldMove = (event: MouseEvent) => {
    const start = held.value;
    if (!start) return;
    if (
      Math.hypot(event.clientX - start.x, event.clientY - start.y) < PULL_PX
    ) {
      return;
    }
    stopHeld();
    lift(start.what, { x: event.clientX, y: event.clientY });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const stopHeld = () => {
    held.value = null;
    window.removeEventListener('mousemove', onHeldMove);
    window.removeEventListener('mouseup', stopHeld);
  };
  const grab = (event: MouseEvent, what: Lifted) => {
    if (event.button !== 0 || lifted.value) return;
    // Not the text selection a drag of the mouse would start.
    event.preventDefault();
    held.value = { x: event.clientX, y: event.clientY, what };
    window.addEventListener('mousemove', onHeldMove);
    window.addEventListener('mouseup', stopHeld);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !lifted.value) return;
    event.preventDefault();
    stopMouse();
    end(false);
  };

  const listen = (el: HTMLElement) => {
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    // Not passive: once a line is lifted, the page must stop scrolling.
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('contextmenu', onContextMenu);
    el.addEventListener('click', onClickCapture, true);
  };
  const unlisten = (el: HTMLElement) => {
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('touchcancel', onTouchEnd);
    el.removeEventListener('contextmenu', onContextMenu);
    el.removeEventListener('click', onClickCapture, true);
  };
  watch(
    board,
    (el, old) => {
      if (old) unlisten(old);
      if (el) listen(el);
    },
    { immediate: true },
  );
  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onBeforeUnmount(() => {
    cancelPress();
    stopMouse();
    stopHeld();
    window.cancelAnimationFrame(frame.value);
    window.removeEventListener('keydown', onKeyDown);
    if (board.value) unlisten(board.value);
  });

  const drag: ListDrag = { lifted, drop, grab, step: on.step };
  provide(LIST_DRAG, drag);
  return { lifted, drop, pointer };
};
