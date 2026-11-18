import { keyboardInset } from '#shared/utils/keyboard';

/**
 * Follows the on-screen keyboard while a bottom sheet is open (iPhone,
 * where the keyboard covers the page instead of shrinking it): sets
 * `--sheet-lift` (how far the sheet must rise) and `--sheet-visible` (the
 * height left) on the page, which every drawer reads (app.config.ts).
 * Nothing on the server, nothing without `visualViewport`.
 * @param active - Whether the sheet is open.
 * @returns The lift and the visible height, in pixels (0 when none).
 */
export const useKeyboardInset = (active: () => boolean) => {
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
      root.setProperty('--sheet-lift', `${inset.value.lift}px`);
      root.setProperty('--sheet-visible', `${inset.value.visible}px`);
    } else {
      root.removeProperty('--sheet-lift');
      root.removeProperty('--sheet-visible');
    }
  };
  const stop = () => {
    window.visualViewport?.removeEventListener('resize', read);
    window.visualViewport?.removeEventListener('scroll', read);
    inset.value = { lift: 0, visible: 0 };
    document.documentElement.style.removeProperty('--sheet-lift');
    document.documentElement.style.removeProperty('--sheet-visible');
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
