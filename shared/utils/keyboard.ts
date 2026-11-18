// What the on-screen keyboard hides at the bottom of the page. On an
// iPhone (and wherever the page is not resized), the keyboard covers the
// layout viewport: a bottom sheet fixed to it would stay under the
// keyboard. Pure, from the sizes the browser gives (`visualViewport`).

/** The sizes read from the browser. */
export type Viewports = {
  /** The layout viewport's height (`window.innerHeight`). */
  layout: number;
  /** The visible part: its height and how far it is scrolled down. */
  visualHeight: number;
  visualTop: number;
};

/** Below this, a difference is the browser's bars, not a keyboard. */
const KEYBOARD_MIN = 80;

/**
 * How far a bottom sheet must rise to stay above the keyboard, and the
 * height it may take.
 * @param v - The sizes of the viewports.
 * @returns The lift and the visible height, in pixels.
 */
export const keyboardInset = (v: Viewports) => {
  const hidden = Math.max(0, v.layout - v.visualHeight - v.visualTop);
  return {
    lift: hidden >= KEYBOARD_MIN ? Math.round(hidden) : 0,
    visible: Math.round(v.visualHeight),
  };
};
