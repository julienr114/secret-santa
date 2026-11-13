<script setup lang="ts">
// Full-width list, iOS style: white rows and hairline separators,
// edge to edge on phones, framed on larger screens.
defineProps<{ title?: string; footer?: string }>();
</script>

<template>
  <section class="flex flex-col gap-1.5">
    <h2
      v-if="title"
      class="px-1 text-xs font-semibold tracking-wide text-muted uppercase"
    >
      {{ title }}
    </h2>
    <ul
      class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
    >
      <slot />
    </ul>
    <p v-if="footer" class="px-1 text-xs text-muted">{{ footer }}</p>
  </section>
</template>
