<script setup lang="ts" generic="T extends string">
// One choice among a few, side by side on a grey track: the one chosen
// is white and bold. Native radios underneath, so the arrows move the
// choice and a screen reader says "1 of 3".
defineProps<{
  items: { value: T; label: string }[];
  /** What is being chosen, for screen readers. */
  label: string;
}>();
const model = defineModel<T>({ required: true });
const name = useId();
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="grid auto-cols-fr grid-flow-col gap-1 rounded-[10px] bg-muted p-1"
  >
    <label
      v-for="item in items"
      :key="item.value"
      class="flex h-10 cursor-pointer items-center justify-center truncate rounded-[7px] px-1 text-sm has-focus-visible:ring-2 has-focus-visible:ring-primary"
      :class="
        model === item.value
          ? 'bg-default font-bold text-highlighted shadow-[0_1px_2px_rgba(60,30,10,0.12)]'
          : 'font-semibold text-toned'
      "
    >
      <input
        v-model="model"
        type="radio"
        class="sr-only"
        :name="name"
        :value="item.value"
      />
      {{ item.label }}
    </label>
  </div>
</template>
