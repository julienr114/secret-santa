<script setup lang="ts">
// The small busy wheel of a row or a switch, 20 px, with what it does
// for screen readers. It stands still under reduced motion.
defineProps<{
  /** "Enregistrement", read by screen readers. */
  label: string;
}>();
</script>

<template>
  <span role="status" :aria-label="label" class="flex shrink-0 text-primary">
    <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
  </span>
</template>
