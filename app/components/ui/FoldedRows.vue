<script setup lang="ts" generic="T">
import type { Avatar } from '#server/utils/avatars';
import type { Fold } from '#shared/utils/lists';

// The rows of a folded list, inside its <ul>: the first rows, those
// unfolded so far, "Voir les N autres" while some are left, and last of
// all "Replier la liste" once some were unfolded. Folding again brings
// the end of the folded list back on screen. Each row is drawn by the
// `row` slot; the texts come from the parent.
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
const more = ref<{ row: HTMLElement | null } | null>(null);
/**
 * Folds the list again, then shows its end, the "Voir les N autres" row.
 * @returns Once it is in sight.
 */
const onCollapse = async () => {
  emit('collapse');
  await nextTick();
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  more.value?.row?.scrollIntoView({
    block: 'center',
    behavior: smooth ? 'smooth' : 'auto',
  });
};
</script>

<template>
  <template
    v-for="item in [...fold.shown, ...fold.unfolded]"
    :key="keyOf(item)"
  >
    <slot name="row" :item="item" />
  </template>
  <UiFoldRow
    v-if="fold.rest.length"
    ref="more"
    :avatars="fold.rest.slice(0, 3).map(avatarOf)"
    :label="moreLabel(fold.rest.length)"
    :detail="detail"
    @expand="emit('more')"
  />
  <UiFoldRow
    v-if="fold.unfolded.length"
    expanded
    :label="collapseLabel"
    :detail="detail"
    @collapse="onCollapse"
  />
</template>
