<script setup lang="ts">
// Three figures side by side, each a big number over its label, both
// aligned left, tinted by what it means: to act on (primary), waiting (warning), done (success).

/** One figure. */
export type Counter = {
  value: number;
  label: string;
  tone: 'primary' | 'warning' | 'success';
};
defineProps<{ items: Counter[] }>();
/** Tile, number and label colours of each tone: the label a shade darker. */
const TONES = {
  primary: {
    tile: 'bg-primary-tint',
    text: 'text-primary-ink',
    label: 'text-brick-800',
  },
  warning: {
    tile: 'bg-warning-tint',
    text: 'text-warning-ink',
    label: 'text-mustard-900',
  },
  success: {
    tile: 'bg-success-tint',
    text: 'text-success-ink',
    label: 'text-pine-800',
  },
};
</script>

<template>
  <dl class="grid auto-cols-fr grid-flow-col gap-2">
    <div
      v-for="item in items"
      :key="item.label"
      class="flex flex-col-reverse justify-end gap-0.5 rounded-[10px] p-2.5"
      :class="TONES[item.tone].tile"
    >
      <dt
        class="text-xs leading-[1.25] font-semibold"
        :class="TONES[item.tone].label"
      >
        {{ item.label }}
      </dt>
      <dd
        class="font-display text-[26px] leading-none font-bold"
        :class="TONES[item.tone].text"
      >
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>
