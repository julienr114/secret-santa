<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// The row that stands for the rest of a long list: three people's icons
// overlapping, "Voir les N autres" (and, if given, what the series is),
// a chevron, then a small gap before what follows. The `detail` slot
// replaces the plain detail, to give it an icon. The same row, without
// the icons and with its chevron up, folds an unfolded list again. The
// texts come from the parent.
const props = withDefaults(
  defineProps<{
    /** A few people of the rest; three show while folded. */
    avatars?: Avatar[];
    /** "Voir les 94 autres", or "Replier la liste". */
    label: string;
    /** What the rows have in common, under the label. */
    detail?: string;
    /** This row folds the list again. */
    expanded?: boolean;
  }>(),
  { avatars: () => [], detail: undefined, expanded: false },
);
const emit = defineEmits<{ expand: []; collapse: [] }>();
const shown = computed(() => props.avatars.slice(0, 3));
const row = ref<HTMLElement | null>(null);
defineExpose({ row });
</script>

<template>
  <li ref="row">
    <button
      type="button"
      :aria-expanded="expanded"
      class="flex min-h-15 w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-muted"
      @click="expanded ? emit('collapse') : emit('expand')"
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
        <span
          v-if="$slots.detail || detail"
          class="flex min-w-0 items-center gap-1.25 truncate text-[13px] text-toned"
        >
          <slot name="detail">{{ detail }}</slot>
        </span>
      </span>
      <UIcon
        :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-5 shrink-0 text-primary-ink"
        aria-hidden="true"
      />
    </button>
  </li>
  <li
    class="-mb-px h-2.5 border-y border-default bg-page last:hidden"
    aria-hidden="true"
  />
</template>
