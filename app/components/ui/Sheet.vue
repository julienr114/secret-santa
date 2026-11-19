<script setup lang="ts">
// A bottom sheet (README 23.3), on Nuxt UI's drawer: a title and a
// description, the body, then the footer with the action and the way
// out. The `header` slot replaces the title for a richer head. How it
// fits the screen (height, scrolling body, safe areas) is set for every
// drawer in app.config.ts; above the on-screen keyboard, it rises
// (useKeyboardInset).
defineProps<{
  title: string;
  description?: string;
  /** An action runs: the sheet cannot be closed until it ends. */
  busy?: boolean;
  /** Opened from another sheet, over it. */
  nested?: boolean;
  /** Classes of the drawer's parts, merged over the sheet's own. */
  ui?: Partial<Record<'container' | 'title' | 'description', string>>;
}>();
const open = defineModel<boolean>('open', { required: true });
// Above the on-screen keyboard (iPhone): the sheet rises by what the
// keyboard hides (read by every drawer, app.config.ts).
useKeyboardInset(() => open.value);
const KEYBOARD_AWARE =
  'bottom-[var(--sheet-lift,0px)] max-h-[min(calc(100dvh-env(safe-area-inset-top)-0.5rem),calc(var(--sheet-visible,100dvh)-0.5rem))] rounded-t-3xl';
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="title"
    :description="description"
    :dismissible="!busy"
    :nested="nested"
    :ui="{
      ...ui,
      // After the drawer's own direction classes (bottom-0, max-h-[96%]),
      // which the shared config cannot override: never taller than the
      // visible screen, and above the on-screen keyboard (iPhone).
      content: KEYBOARD_AWARE,
      title: `font-display text-[22px] leading-[1.15] font-bold ${ui?.title ?? ''}`,
      description: `text-sm text-toned ${ui?.description ?? ''}`,
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
