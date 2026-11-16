<script setup lang="ts" generic="T">
import type { Avatar } from '#server/utils/avatars';
import type { Fold } from '#shared/utils/lists';

// The rows of a folded list, inside its <ul>: the first rows, then
// "Replier la liste" and the rows unfolded so far, then "Voir les N
// autres" while some are left. Each row is drawn by the `row` slot; the
// texts come from the parent.
defineProps<{
  fold: Fold<T>;
  /** The key of a row. */
  keyOf: (item: T) => string;
  /** The icon of a person, for the three shown on the fold row. */
  avatarOf: (item: T) => Avatar;
  /** "Voir les 94 autres". */
  moreLabel: (count: number) => string;
  /** "Replier la liste". */
  collapseLabel: string;
  /** What the folded rows have in common. */
  detail?: string;
}>();
const emit = defineEmits<{ more: []; collapse: [] }>();
</script>

<template>
  <template v-for="item in fold.shown" :key="keyOf(item)">
    <slot name="row" :item="item" />
  </template>
  <UiFoldRow
    v-if="fold.unfolded.length"
    expanded
    :label="collapseLabel"
    @collapse="emit('collapse')"
  />
  <template v-for="item in fold.unfolded" :key="keyOf(item)">
    <slot name="row" :item="item" />
  </template>
  <UiFoldRow
    v-if="fold.rest.length"
    :avatars="fold.rest.slice(0, 3).map(avatarOf)"
    :label="moreLabel(fold.rest.length)"
    :detail="detail"
    @expand="emit('more')"
  />
</template>
