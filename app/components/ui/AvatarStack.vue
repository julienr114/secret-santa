<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { stackOf } from '#shared/utils/lists';

// A few people's icons overlapping, then "+N" for the others. The names
// are for whoever uses it to say in words, `label` naming the whole. The
// gradient alone under their ring: no shadow.
const props = withDefaults(
  defineProps<{
    avatars: Avatar[];
    /** Accessible description of the group, e.g. "4 participants". */
    label: string;
    max?: number;
  }>(),
  { max: 4 },
);
const stack = computed(() => stackOf(props.avatars, props.max));
</script>

<template>
  <span class="flex items-center" role="img" :aria-label="label">
    <UiAvatar
      v-for="(avatar, index) in stack.shown"
      :key="index"
      :avatar="avatar"
      size="sm"
      flat
      class="-ml-2 ring-2 ring-default first:ml-0"
    />
    <span
      v-if="stack.more > 0"
      class="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-divider px-1.5 text-xs font-bold ring-2 ring-default"
      aria-hidden="true"
      >+{{ stack.more }}</span
    >
  </span>
</template>
