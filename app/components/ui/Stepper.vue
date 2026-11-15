<script setup lang="ts">
// A row of steps joined by a line: done (green, with a check), current
// (brick, with a halo, `aria-current="step"`) or still to come (empty).
// Shows where things stand; it is not a navigation.

/** One step and where it stands. */
export type Step = {
  label: string;
  state: 'done' | 'current' | 'todo';
  /** Icon in the current step's circle instead of its number. */
  icon?: string;
};
defineProps<{
  steps: Step[];
  /** Accessible name of the list of steps. */
  label: string;
}>();
/** Circle of each state. */
const CIRCLES = {
  done: 'bg-success text-inverted',
  current:
    'bg-primary text-inverted ring-4 ring-primary-soft font-display font-bold',
  todo: 'bg-page text-muted ring-2 ring-inset ring-default',
};
/** Label of each state. */
const LABELS = {
  done: 'font-semibold text-muted',
  current: 'font-bold text-primary-ink',
  todo: 'font-semibold text-muted',
};
</script>

<template>
  <ol class="grid auto-cols-fr grid-flow-col" :aria-label="label">
    <li
      v-for="(step, index) in steps"
      :key="step.label"
      class="relative flex flex-col items-center gap-1.5 text-center"
      :aria-current="step.state === 'current' ? 'step' : undefined"
    >
      <span
        v-if="index < steps.length - 1"
        class="absolute top-3 left-1/2 h-0.5 w-full"
        :class="step.state === 'done' ? 'bg-success' : 'bg-divider'"
        aria-hidden="true"
      />
      <span
        class="relative flex size-6 items-center justify-center rounded-full text-xs"
        :class="CIRCLES[step.state]"
        aria-hidden="true"
      >
        <UIcon
          v-if="step.state === 'done'"
          name="i-lucide-check"
          class="size-4"
        />
        <UIcon
          v-else-if="step.state === 'current' && step.icon"
          :name="step.icon"
          class="size-3.5"
        />
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="text-xs" :class="LABELS[step.state]">{{ step.label }}</span>
    </li>
  </ol>
</template>
