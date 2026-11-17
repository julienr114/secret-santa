<script setup lang="ts">
// The white band stuck to the bottom of a long screen, which holds its
// main action (and a line under it) in reach at all times. It reaches the
// very bottom of the page, over the screen's and the layout's padding. On
// a wide screen the band and its top line run the whole width of the
// window, while the button stays in the column: the border image is
// painted beyond the box (outset) without widening the page.
</script>

<template>
  <div
    class="sticky bottom-0 -mx-4 mt-auto -mb-[calc(3.25rem+env(safe-area-inset-bottom))] flex flex-col gap-2 px-4 pt-3.5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] [border-image:linear-gradient(to_bottom,var(--ui-border)_1px,var(--ui-bg)_1px)_fill_0//0_100vmax]"
  >
    <slot />
  </div>
</template>
