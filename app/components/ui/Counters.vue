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
/** Tile, number and label colours of each tone. */
const TONES = {
  primary: { tile: 'bg-primary-tint', text: 'text-primary-ink' },
  warning: { tile: 'bg-warning-tint', text: 'text-warning-ink' },
  success: { tile: 'bg-success-tint', text: 'text-success-ink' },
};
</script>

<template>
  <dl class="grid auto-cols-fr grid-flow-col gap-2">
    <div
      v-for="item in items"
      :key="item.label"
      class="flex flex-col-reverse justify-end gap-1 rounded-xl p-3"
      :class="[TONES[item.tone].tile, TONES[item.tone].text]"
    >
      <dt class="text-[13px] leading-snug font-semibold">{{ item.label }}</dt>
      <dd class="font-display text-[30px] leading-none font-bold">
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>
