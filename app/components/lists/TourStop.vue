<script setup lang="ts">
import type { TourStep } from '#shared/utils/listTour';
import { TOUR_RAISED } from '~/composables/useListTour';

// What a step of the visit of a new list puts in the light (ticket 149):
// out of the visit, nothing around it (`display: contents`, a sticky bar
// stays sticky); at its step, raised over the veil on the page's colour,
// its note under it or above it.
const props = defineProps<{ step: TourStep | null }>();
const el = ref<HTMLElement | null>(null);
const { active, placement } = useTourStop(() => props.step, el);
const raised = `${TOUR_RAISED} -mx-2.5 -my-1.5 px-2.5 py-1.5`;
</script>

<template>
  <div ref="el" :class="active ? raised : 'contents'">
    <slot />
    <ListsTourNote v-if="active && step" :step="step" :placement="placement" />
  </div>
</template>
