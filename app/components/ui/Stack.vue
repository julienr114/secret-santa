<script setup lang="ts">
// A card laid on a stack: under it, the edge of one card per thing
// waiting behind it, two at most, each a little narrower and darker.
// Without any, just the card.
const props = defineProps<{
  /** How many wait behind the card on top. */
  behind: number;
}>();
const edges = computed(() => Math.min(Math.max(props.behind, 0), 2));
</script>

<template>
  <div
    class="relative"
    :class="{ 'pb-[9px]': edges === 1, 'pb-[18px]': edges === 2 }"
  >
    <span
      v-if="edges === 2"
      class="absolute inset-x-6 bottom-0 h-10 rounded-2xl bg-stack-back shadow-[0_1px_2px_rgba(60,30,10,0.08),0_0_0_1px_rgba(0,0,0,0.05)]"
      aria-hidden="true"
    />
    <span
      v-if="edges > 0"
      class="absolute inset-x-3 h-10 rounded-2xl bg-stack shadow-[0_1px_2px_rgba(60,30,10,0.08),0_0_0_1px_rgba(0,0,0,0.05)]"
      :class="edges === 2 ? 'bottom-[9px]' : 'bottom-0'"
      aria-hidden="true"
    />
    <div class="relative"><slot /></div>
  </div>
</template>
