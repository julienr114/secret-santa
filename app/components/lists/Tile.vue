<script setup lang="ts">
import { listShade } from '~/utils/listShades';

// The icon of a list: its symbol on a square tile of solid colour
// (README 22.19), as Apple draws it on every device.
const props = withDefaults(
  defineProps<{
    icon: { emoji: string; color: string };
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' },
);
const SIZES = {
  sm: 'size-10 rounded-md text-xl',
  md: 'size-14 rounded-xl text-[28px]',
  lg: 'size-18 rounded-2xl text-[36px]',
};
const shade = computed(() => listShade(props.icon.color));
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center shadow-[0_1px_2px_rgba(60,30,10,0.12)]"
    :class="SIZES[size]"
    :style="{ backgroundColor: shade.bg }"
    aria-hidden="true"
  >
    <UiEmoji :emoji="icon.emoji" />
  </span>
</template>
