<script setup lang="ts">
import { emptyBelow } from '#shared/utils/keyboard';

// The white band stuck to the bottom of a long screen, which holds its
// main action (and a line under it) in reach at all times. It reaches the
// very bottom of the page, over the screen's and the layout's padding. On
// a wide screen the band and its top line run the whole width of the
// window, while the button stays in the column: the border image is
// painted beyond the box (outset) without widening the page. Under the
// button, the home bar's room or 1 rem, not both.
// On an iPhone the keyboard covers the page instead of shrinking it. While
// it is up (decided by Julien on 18 November 2026), the band rests on the
// keyboard, as in a messaging app: the field being written is kept above
// it, and the page cannot be scrolled past its end into the empty space
// the keyboard leaves (useKeyboardInset).
const inset = useKeyboardInset(() => true, 'keyboard');
const keyboard = computed(() => inset.value.lift > 0);
const band = ref<HTMLElement>();
const spacer = ref<HTMLElement>();
const bandHeight = ref(0);

/**
 * The empty page shown under the end of the content, the band included.
 * @returns Its height in pixels, 0 when none.
 */
const empty = () => {
  const vv = window.visualViewport;
  if (!vv || !spacer.value) return 0;
  return emptyBelow({
    contentBottom: spacer.value.getBoundingClientRect().bottom,
    visualTop: vv.offsetTop,
    visualHeight: vv.height,
  });
};
/** Where the finger went down. */
const start = { y: 0 };
const onTouchStart = (event: TouchEvent) => {
  start.y = event.touches[0]?.clientY ?? 0;
};
/** No dragging the page up past its end while the keyboard is up. */
const onTouchMove = (event: TouchEvent) => {
  const y = event.touches[0]?.clientY ?? start.y;
  if (y < start.y && empty() > 0) event.preventDefault();
};
/** What the browser scrolled past the end anyway, taken back. */
const onScroll = () => {
  const gap = empty();
  if (gap > 0) window.scrollBy(0, -gap);
};
const listen = (on: boolean) => {
  if (on) {
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('scroll', onScroll);
    window.visualViewport?.addEventListener('scroll', onScroll);
  } else {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('scroll', onScroll);
    window.visualViewport?.removeEventListener('scroll', onScroll);
  }
};
watch(keyboard, async (up) => {
  if (import.meta.server) return;
  listen(up);
  if (!up) return;
  bandHeight.value = band.value?.offsetHeight ?? 0;
  await nextTick();
  // The field being written stays above the band.
  const field = document.activeElement;
  if (field instanceof HTMLElement && field !== document.body) {
    field.style.scrollMarginBottom = `${bandHeight.value + 16}px`;
    field.scrollIntoView({ block: 'nearest' });
  }
  onScroll();
});
onBeforeUnmount(() => {
  if (import.meta.client) listen(false);
});
</script>

<template>
  <div
    ref="spacer"
    class="mt-auto -mb-[calc(3.25rem+env(safe-area-inset-bottom))]"
    :class="keyboard ? '' : 'sticky bottom-0 z-10'"
    :style="keyboard ? { height: `${bandHeight}px` } : undefined"
  >
    <div
      ref="band"
      class="flex flex-col gap-2 px-4 pt-3.5 [border-image:linear-gradient(to_bottom,var(--ui-border)_1px,var(--ui-bg)_1px)_fill_0//0_100vmax]"
      :class="
        keyboard
          ? 'fixed inset-x-0 bottom-[var(--keyboard-lift,0px)] z-10 mx-auto w-full max-w-md pb-3'
          : '-mx-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
      "
      data-testid="sticky-footer"
    >
      <slot />
    </div>
  </div>
</template>
