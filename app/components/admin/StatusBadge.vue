<script setup>
import { BADGE_LABELS, STATUS_LABELS } from '~/utils/labels.js';

const props = defineProps({ code: { type: String, required: true } });
const TONES = {
  draft: 'bg-neutral-100 text-neutral-700',
  invitations: 'bg-amber-100 text-amber-800',
  drawn: 'bg-green-100 text-green-800',
  closed: 'bg-neutral-200 text-neutral-600',
  sent: 'bg-sky-100 text-sky-800',
  pin_set: 'bg-green-100 text-green-800',
  wishes: 'bg-pink-100 text-pink-800',
  viewed: 'bg-violet-100 text-violet-800',
  locked: 'bg-red-100 text-red-800',
};
const label = computed(
  () => STATUS_LABELS[props.code] ?? BADGE_LABELS[props.code] ?? props.code,
);
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="TONES[code] ?? 'bg-neutral-100 text-neutral-700'"
  >
    {{ label }}
  </span>
</template>
