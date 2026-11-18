import { keyboardInset } from '#shared/utils/keyboard';

/**
 * Follows the on-screen keyboard (iPhone, where the keyboard covers the
 * page instead of shrinking it): sets `--{name}-lift` (how far what sits
 * at the bottom must rise) and `--{name}-visible` (the height left) on the
 * page. `sheet` while a bottom sheet is open, read by every drawer
 * (app.config.ts); `keyboard` while a page has a sticky footer, read by
 * the footer and the screens' height (README 23.3).
 * Nothing on the server, nothing without `visualViewport`.
 * @param active - Whether to follow it.
 * @param name - The prefix of the two variables.
 * @returns The lift and the visible height, in pixels (0 when none).
 */
export const useKeyboardInset = (
  active: () => boolean,
  name: 'sheet' | 'keyboard' = 'sheet',
) => {
  const lift = `--${name}-lift`;
  const visible = `--${name}-visible`;
  const inset = ref({ lift: 0, visible: 0 });
  const read = () => {
    const vv = window.visualViewport;
    if (!vv) return;
    inset.value = keyboardInset({
      layout: window.innerHeight,
      visualHeight: vv.height,
      visualTop: vv.offsetTop,
    });
    const root = document.documentElement.style;
    if (inset.value.lift > 0) {
      root.setProperty(lift, `${inset.value.lift}px`);
      root.setProperty(visible, `${inset.value.visible}px`);
    } else {
      root.removeProperty(lift);
      root.removeProperty(visible);
    }
  };
  const stop = () => {
    window.visualViewport?.removeEventListener('resize', read);
    window.visualViewport?.removeEventListener('scroll', read);
    inset.value = { lift: 0, visible: 0 };
    document.documentElement.style.removeProperty(lift);
    document.documentElement.style.removeProperty(visible);
  };
  watch(
    active,
    (on) => {
      if (import.meta.server || !window.visualViewport) return;
      if (!on) return stop();
      window.visualViewport.addEventListener('resize', read);
      window.visualViewport.addEventListener('scroll', read);
      read();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => {
    if (import.meta.client) stop();
  });
  return inset;
};
