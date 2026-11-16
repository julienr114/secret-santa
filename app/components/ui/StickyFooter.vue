<script setup lang="ts">
// The white band stuck to the bottom of a long screen, which holds its
// main action (and a line under it) in reach at all times. It reaches the
// very bottom of the page, over the screen's and the layout's padding.
</script>

<template>
  <div
    class="sticky bottom-0 -mx-4 mt-auto -mb-[calc(3.25rem+env(safe-area-inset-bottom))] flex flex-col gap-2 border-t border-default bg-default px-4 pt-3.5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
  >
    <slot />
  </div>
</template>
