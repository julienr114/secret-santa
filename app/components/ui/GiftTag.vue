<script setup lang="ts">
// A card cut like a gift tag: a round hole at the top, in the middle,
// then whatever the slot holds.
</script>

<template>
  <div
    class="relative flex flex-col gap-5 rounded-2xl bg-default px-5 pt-12 pb-6 shadow-card"
  >
    <span
      class="absolute top-4 left-1/2 size-5 -translate-x-1/2 rounded-full bg-page ring-2 ring-default ring-inset"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>
