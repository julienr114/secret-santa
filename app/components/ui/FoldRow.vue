<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// The row that stands for the rest of a long list. Folded: three people's
// icons overlapping, "Voir les N autres" (and, if given, what the series
// is), then a small gap before what follows. Unfolded: the same row stays
// in place as "Replier la liste", tinted; a tap folds the list again and
// brings the row back on screen. The texts come from the parent.
const props = withDefaults(
  defineProps<{
    /** A few people of the rest; three show while folded. */
    avatars?: Avatar[];
    /** "Voir les 94 autres", or "Replier la liste" once unfolded. */
    label: string;
    /** What the rest have in common, under the label. */
    detail?: string;
    /** The list is unfolded: this row folds it again. */
    expanded?: boolean;
  }>(),
  { avatars: () => [], detail: undefined, expanded: false },
);
const emit = defineEmits<{ expand: []; collapse: [] }>();
const shown = computed(() => props.avatars.slice(0, 3));
const row = ref<HTMLElement | null>(null);
/**
 * Unfolds, or folds again and keeps the row in sight.
 * @returns Once the row is back on screen.
 */
const onTap = async () => {
  if (!props.expanded) {
    emit('expand');
    return;
  }
  emit('collapse');
  await nextTick();
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  row.value?.scrollIntoView({
    block: 'nearest',
    behavior: smooth ? 'smooth' : 'auto',
  });
};
</script>

<template>
  <li ref="row">
    <button
      type="button"
      :aria-expanded="expanded"
      class="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-muted"
      :class="expanded ? 'min-h-13 bg-primary-tint' : 'min-h-15'"
      @click="onTap"
    >
      <span
        v-if="!expanded"
        class="flex w-11 shrink-0 items-center"
        aria-hidden="true"
      >
        <UiAvatar
          v-for="(avatar, index) in shown"
          :key="index"
          :avatar="avatar"
          size="sm"
          class="-ml-[17px] size-6.5! text-xs! ring-2 ring-default first:ml-0"
        />
      </span>
      <span class="flex min-w-0 grow flex-col">
        <span class="truncate text-[15px] font-bold text-primary-ink">{{
          label
        }}</span>
        <span v-if="detail" class="truncate text-sm text-muted">{{
          detail
        }}</span>
      </span>
      <UIcon
        :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-5 shrink-0 text-primary-ink"
        aria-hidden="true"
      />
    </button>
  </li>
  <li
    v-if="!expanded"
    class="-mb-px h-2.5 border-y border-default bg-page last:hidden"
    aria-hidden="true"
  />
</template>
