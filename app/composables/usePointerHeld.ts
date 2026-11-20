// Whether a finger or the mouse is down now, anywhere on the page: one
// set of listeners for the whole app. Closing something under a press
// moves the page before the press ends, and the tap then lands beside
// what was aimed at: whatever would close waits for the press to end.
const held = { down: false, bound: false };

/** How long the click of a release may take to come (a finger's does). */
const CLICK_WAIT_MS = 80;

const bind = () => {
  if (held.bound || !import.meta.client) return;
  held.bound = true;
  const set = (down: boolean) => () => {
    held.down = down;
  };
  window.addEventListener('pointerdown', set(true), true);
  window.addEventListener('pointerup', set(false), true);
  window.addEventListener('pointercancel', set(false), true);
};

/**
 * Runs something once nothing is pressed any more: at once when nothing
 * is; otherwise as the click of the release arrives, which was aimed
 * before anything moved, or a moment after a release without a click.
 * @returns How to run it.
 */
export const usePointerHeld = () => {
  bind();
  return (then: () => void) => {
    if (!held.down) return then();
    const state = { ran: false, timer: 0 };
    const finish = () => {
      window.removeEventListener('pointerup', onRelease, true);
      window.removeEventListener('pointercancel', onRelease, true);
      window.removeEventListener('click', onClick, true);
      window.clearTimeout(state.timer);
      if (state.ran) return;
      state.ran = true;
      then();
    };
    // The click knows its target already: what closes now moves nothing
    // from under it.
    const onClick = () => queueMicrotask(finish);
    const onRelease = () => {
      window.addEventListener('click', onClick, true);
      state.timer = window.setTimeout(finish, CLICK_WAIT_MS);
    };
    // Caught on the way down, so that nothing on the page can hide them.
    window.addEventListener('pointerup', onRelease, true);
    window.addEventListener('pointercancel', onRelease, true);
  };
};
