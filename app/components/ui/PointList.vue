<script setup lang="ts">
// A few points, each after a small dot or its icon: what an action
// changes, what stays as it is, why to be careful. The marker takes the
// colour of `tone`, the words that of the parent. The texts come from
// the parent.

/** One point of the list; a dot when it has no icon. */
export type Point = { text: string; icon?: string };
withDefaults(
  defineProps<{
    points: Point[];
    /** The colour of the markers: the text's own, green, or red. */
    tone?: 'inherit' | 'success' | 'error';
    /** More room between points, in a framed card. */
    loose?: boolean;
  }>(),
  { tone: 'inherit', loose: false },
);
/** Marker colour of each tone. */
const TONES = {
  inherit: '',
  success: 'text-success',
  error: 'text-error-ink',
};
</script>

<template>
  <ul
    class="flex flex-col text-sm leading-[1.4]"
    :class="loose ? 'gap-2' : 'gap-1.5'"
  >
    <li
      v-for="point in points"
      :key="point.text"
      class="flex items-start"
      :class="point.icon ? 'gap-2.5' : 'gap-2'"
    >
      <UIcon
        v-if="point.icon"
        :name="point.icon"
        class="mt-px size-4.5 shrink-0"
        :class="TONES[tone]"
        aria-hidden="true"
      />
      <span
        v-else
        class="mt-2 size-1.5 shrink-0 rounded-full bg-current"
        :class="TONES[tone]"
        aria-hidden="true"
      />
      <span>{{ point.text }}</span>
    </li>
  </ul>
</template>
