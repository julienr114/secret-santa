<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';

// A person's Christmas emoji in a coloured circle.
const props = withDefaults(
  defineProps<{ avatar: Avatar; size?: 'sm' | 'md' | 'lg' }>(),
  {
    size: 'md',
  },
);
const SIZES = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-lg',
  lg: 'size-20 text-3xl',
};
const shade = computed(() => AVATAR_SHADES[props.avatar.color]);
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full ring-1"
    :class="SIZES[size]"
    :style="{ backgroundColor: shade.bg, '--tw-ring-color': shade.ring }"
    aria-hidden="true"
  >
    {{ avatar.emoji }}
  </span>
</template>
