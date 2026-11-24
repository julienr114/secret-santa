<script setup lang="ts">
import type { TourStep } from '#shared/utils/listTour';

// The note of a step of the visit of a new list (ticket 149), under what
// is in the light, or above it when it is low on the screen. Its texts
// follow the visit (`lists.tour.secret.*`, `lists.tour.create.*`).
const props = defineProps<{
  step: TourStep;
  placement: 'below' | 'above';
}>();
const { tk } = useT();
const tour = useListTour();
const texts = computed(() => {
  const base = `lists.tour.${tour.kind.value ?? 'create'}.${props.step}`;
  return { title: tk(`${base}.title`), body: tk(`${base}.body`) };
});
</script>

<template>
  <div
    class="absolute inset-x-2.5 z-10"
    :class="
      placement === 'above' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
    "
    :data-testid="`tour-${step}`"
  >
    <ListsVeilNote
      tone="plum"
      tip="left"
      name="tour"
      tour
      :above="placement === 'above'"
      :title="texts.title"
      :body="texts.body"
      :step="tour.position.value"
      @skip="tour.skip()"
      @next="tour.next()"
      @understood="tour.next()"
    />
  </div>
</template>
