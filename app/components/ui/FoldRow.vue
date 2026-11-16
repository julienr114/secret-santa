<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// The row that stands for the rest of a long list: three people's icons
// overlapping, "Voir les N autres" (and, if given, what the series is),
// then a small gap before what follows the list. A tap unfolds the list
// in place; the parent then shows every row and drops this one.
const props = defineProps<{
  /** A few people of the rest; three show. */
  avatars: Avatar[];
  /** "Voir les 94 autres". */
  label: string;
  /** What the rest have in common, under the label. */
  detail?: string;
}>();
const emit = defineEmits<{ expand: [] }>();
const shown = computed(() => props.avatars.slice(0, 3));
</script>

<template>
  <li>
    <button
      type="button"
      aria-expanded="false"
      class="flex min-h-15 w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-muted"
      @click="emit('expand')"
    >
      <span class="flex w-11 shrink-0 items-center" aria-hidden="true">
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
        name="i-lucide-chevron-down"
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
