<script setup lang="ts">
// A bottom sheet (README 23.3), on Nuxt UI's drawer: a title and a
// description, the body, then the footer with the action and the way
// out. The `header` slot replaces the title for a richer head. How it
// fits the screen (height, scrolling body, safe areas) is set for every
// drawer in app.config.ts.
defineProps<{
  title: string;
  description?: string;
  /** An action runs: the sheet cannot be closed until it ends. */
  busy?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="title"
    :description="description"
    :dismissible="!busy"
    :ui="{
      title: 'font-display text-[22px] leading-[1.15] font-bold',
      description: 'text-sm text-toned',
    }"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template #body>
      <slot />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </UDrawer>
</template>
