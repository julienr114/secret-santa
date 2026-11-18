<script setup lang="ts">
// The white band stuck to the bottom of a long screen, which holds its
// main action (and a line under it) in reach at all times. It reaches the
// very bottom of the page, over the screen's and the layout's padding. On
// a wide screen the band and its top line run the whole width of the
// window, while the button stays in the column: the border image is
// painted beyond the box (outset) without widening the page. Under the
// button, the home bar's room or 1 rem, not both.
// On an iPhone the keyboard covers the page instead of shrinking it: while
// it is up, the screen is no taller than what is left above it, and the
// band follows the content instead of floating over the field being
// written (useKeyboardInset), so no empty space is left to scroll.
const inset = useKeyboardInset(() => true, 'keyboard');
const keyboard = computed(() => inset.value.lift > 0);
</script>

<template>
  <div
    class="z-10 -mx-4 mt-auto -mb-[calc(3.25rem+env(safe-area-inset-bottom))] flex flex-col gap-2 px-4 pt-3.5 [border-image:linear-gradient(to_bottom,var(--ui-border)_1px,var(--ui-bg)_1px)_fill_0//0_100vmax]"
    :class="
      keyboard
        ? 'pb-3.5'
        : 'sticky bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]'
    "
    data-testid="sticky-footer"
  >
    <slot />
  </div>
</template>
