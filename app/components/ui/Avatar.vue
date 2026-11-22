<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';
import { personSticker } from '~/utils/stickers';

// A person's emoji on a round sticker (README 23.5): a soft gradient, a
// white edge and a cast shadow that follow its size. Drawn as Apple's
// image on every device (`UiEmoji`). `px` gives a size of its own, in
// place of the four named ones. `flat` keeps the gradient alone: icons
// that overlap, the images of the palmarès, which bring their own ring.
// Without an avatar (a first name written for someone, « Cocher pour
// quelqu'un »), a peach disc with the icon of a person.
const props = withDefaults(
  defineProps<{
    avatar: Avatar | null;
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
  ...(props.avatar
    ? personSticker(
        AVATAR_SHADES[props.avatar.color],
        diameter.value,
        props.flat,
      )
    : {}),
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
    :class="[px ? '' : SIZES[size].class, avatar ? '' : 'bg-muted text-toned']"
    :style="style"
    aria-hidden="true"
  >
    <UiEmoji v-if="avatar" :emoji="avatar.emoji" />
    <UIcon v-else name="i-lucide-user" class="size-1/2" />
  </span>
</template>
