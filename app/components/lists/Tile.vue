<script setup lang="ts">
import { listShade } from '~/utils/listShades';
import { tileSticker } from '~/utils/stickers';

// The icon of a list: its symbol on a square sticker (README 23.5), a
// gradient, a white edge and a cast shadow, tilted by 3 degrees; as Apple
// draws the symbol on every device. `flat` keeps it straight, the
// gradient alone.
const props = withDefaults(
  defineProps<{
    icon: { emoji: string; color: string };
    size?: 'sm' | 'md' | 'lg';
    flat?: boolean;
  }>(),
  { size: 'md', flat: false },
);
const SIZES = {
  sm: { class: 'size-10 text-xl', px: 40 },
  md: { class: 'size-14 text-[28px]', px: 56 },
  lg: { class: 'size-18 text-[36px]', px: 72 },
};
const style = computed(() =>
  tileSticker(listShade(props.icon.color), SIZES[props.size].px, props.flat),
);
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center"
    :class="SIZES[size].class"
    :style="style"
    aria-hidden="true"
    data-testid="list-tile"
  >
    <UiEmoji :emoji="icon.emoji" />
  </span>
</template>
