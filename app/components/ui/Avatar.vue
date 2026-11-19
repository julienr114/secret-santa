<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';
import { personSticker } from '~/utils/stickers';

// A person's emoji on a round sticker (README 23.5): a soft gradient, a
// white edge and a cast shadow that follow its size. Drawn as Apple's
// image on every device (`UiEmoji`). `px` gives a size of its own, in
// place of the four named ones. `flat` keeps the gradient alone: icons
// that overlap, the images of the palmarès, which bring their own ring.
const props = withDefaults(
  defineProps<{
    avatar: Avatar;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** A diameter of its own, in pixels. */
    px?: number;
    flat?: boolean;
  }>(),
  { size: 'md', px: undefined, flat: false },
);
const SIZES = {
  sm: { class: 'size-8 text-sm', px: 32 },
  md: { class: 'size-10 text-lg', px: 40 },
  lg: { class: 'size-14 text-2xl', px: 56 },
  xl: { class: 'size-20 text-3xl', px: 80 },
};
const diameter = computed(() => props.px ?? SIZES[props.size].px);
const style = computed(() => ({
  ...personSticker(
    AVATAR_SHADES[props.avatar.color],
    diameter.value,
    props.flat,
  ),
  ...(props.px
    ? {
        width: `${props.px}px`,
        height: `${props.px}px`,
        fontSize: `${Math.round(props.px / 2)}px`,
      }
    : {}),
}));
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full"
    :class="px ? '' : SIZES[size].class"
    :style="style"
    aria-hidden="true"
  >
    <UiEmoji :emoji="avatar.emoji" />
  </span>
</template>
