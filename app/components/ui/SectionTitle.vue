<script setup lang="ts">
// The label above a group of fields or a list: small capitals by
// default, a real heading (`size="lg"`) for the main sections of a page.
withDefaults(defineProps<{ size?: 'sm' | 'lg' }>(), { size: 'sm' });
</script>

<template>
  <h2
    v-if="size === 'lg'"
    class="px-1 pt-2 font-display text-xl font-bold text-default"
  >
    <slot />
  </h2>
  <h2
    v-else
    class="px-1 text-xs font-semibold tracking-wide text-muted uppercase"
  >
    <slot />
  </h2>
</template>
