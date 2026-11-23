<script setup lang="ts" generic="T extends string">
// One choice among a few, side by side on a grey track: the one chosen
// is white and bold. Native radios underneath, so the arrows move the
// choice and a screen reader says "1 of 3". The corners nest: the radius
// of a choice is the track's less the space between them (ticket 141).
// `sm`, in the bar of a list: 34 px high, still 44 px to touch, by an
// invisible margin.
withDefaults(
  defineProps<{
    items: { value: T; label: string }[];
    /** What is being chosen, for screen readers. */
    label: string;
    size?: 'md' | 'sm';
    /** `game`: on the light green card of « Devine qui » (ticket 150). */
    tone?: 'neutral' | 'game';
  }>(),
  { size: 'md', tone: 'neutral' },
);
const model = defineModel<T>({ required: true });
const name = useId();
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="grid auto-cols-fr grid-flow-col rounded-md"
    :class="[
      size === 'sm' ? 'gap-[3px] p-[3px]' : 'gap-1 p-1',
      tone === 'game' ? 'bg-game-track' : 'bg-muted',
    ]"
  >
    <label
      v-for="item in items"
      :key="item.value"
      class="relative flex min-w-0 cursor-pointer items-center justify-center px-1 text-sm has-focus-visible:ring-2 has-focus-visible:ring-primary"
      :class="[
        size === 'sm'
          ? 'isolate h-7 rounded-[calc(var(--radius-md)-3px)] after:absolute after:inset-x-0 after:-inset-y-2 after:-z-10'
          : 'h-10 rounded-[calc(var(--radius-md)-0.25rem)]',
        model === item.value
          ? [
              'bg-default font-bold shadow-[0_1px_2px_rgba(60,30,10,0.12)]',
              tone === 'game' ? 'text-game-strong' : 'text-highlighted',
            ]
          : ['font-semibold', tone === 'game' ? 'text-game-ink' : 'text-toned'],
      ]"
    >
      <input
        v-model="model"
        type="radio"
        class="sr-only"
        :name="name"
        :value="item.value"
      />
      <span class="truncate">{{ item.label }}</span>
    </label>
  </div>
</template>
