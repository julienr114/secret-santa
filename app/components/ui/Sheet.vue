<script setup lang="ts">
// A bottom sheet (README 23.3), on Nuxt UI's drawer: a title and a
// description, the body, then the footer with the action and the way
// out. The `header` slot replaces the title for a richer head.
defineProps<{ title: string; description?: string }>();
const open = defineModel<boolean>('open', { required: true });
</script>

<template>
  <UDrawer v-model:open="open" :title="title" :description="description">
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
