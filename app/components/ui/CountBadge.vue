<script setup lang="ts">
// A count in a coral pill, at the end of a row or of a menu item: how
// many things wait. The words are read out instead of the number.
defineProps<{
  count: number;
  /** What the count means, for screen readers: « 1 demande à traiter ». */
  label: string;
}>();
</script>

<template>
  <span
    role="img"
    :aria-label="label"
    class="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-[7px] text-[13px] font-bold text-white tabular-nums"
    >{{ count }}</span
  >
</template>
