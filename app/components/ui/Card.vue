<script setup lang="ts">
// A raised white surface on the kraft page, for what stands apart from
// the lists: the state of an edition, a result, a milestone.
withDefaults(
  defineProps<{
    as?: string;
    /** Inner spacing: `md` for compact blocks, `lg` for a centred message. */
    padding?: 'none' | 'md' | 'lg';
  }>(),
  { as: 'section', padding: 'md' },
);
/** Tailwind class of each inner spacing. */
const PADDINGS = { none: '', md: 'p-4', lg: 'p-6' };
</script>

<template>
  <component
    :is="as"
    class="rounded-2xl bg-default shadow-sm ring-1 ring-black/5"
    :class="PADDINGS[padding]"
  >
    <slot />
  </component>
</template>
