<script setup lang="ts">
// Full-width list, iOS style: white rows and hairline separators,
// edge to edge on phones, framed on larger screens.
defineProps<{
  title?: string;
  footer?: string;
  /** `lg` makes the title a main heading of the page. */
  titleSize?: 'sm' | 'lg';
}>();
</script>

<template>
  <section class="flex flex-col gap-1.5">
    <UiSectionTitle v-if="title" :size="titleSize">{{ title }}</UiSectionTitle>
    <ul
      class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
    >
      <slot />
    </ul>
    <p v-if="footer" class="px-1 text-xs text-muted">{{ footer }}</p>
  </section>
</template>
