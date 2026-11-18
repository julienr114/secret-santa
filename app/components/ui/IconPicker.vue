<script setup lang="ts">
// Choosing an icon: a symbol and a colour (lot 20, maquette
// PanneauAvatarGrand). The symbols on three rows that scroll sideways,
// the families one after the other, each under its title, no tabs;
// opened on the one chosen, and brought into view when it changes (« Au
// hasard »). Then « Couleur » and the colours on one line. Each target is
// 44 px. Round for a person, square for a list (lot 21); the families,
// the colours and the texts come from the parent.
export type IconChoice = { emoji: string; color: string };
export type IconFamily = {
  key: string;
  label: string;
  emojis: readonly string[];
};
export type IconColor = {
  key: string;
  label: string;
  bg: string;
  ring: string;
};

const props = withDefaults(
  defineProps<{
    families: readonly IconFamily[];
    colors: readonly IconColor[];
    shape?: 'round' | 'square';
    symbolLabel: string;
    colorLabel: string;
  }>(),
  { shape: 'round' },
);
const model = defineModel<IconChoice>({ required: true });
const grid = ref<HTMLElement | null>(null);
const corner = computed(() =>
  props.shape === 'round' ? 'rounded-full' : 'rounded-[12px]',
);
const shade = computed(
  () =>
    props.colors.find((c) => c.key === model.value.color) ?? props.colors[0],
);

/**
 * Brings the chosen symbol into view.
 * @param inline - Where it ends up in the row.
 */
const showChosen = (inline: ScrollLogicalPosition) =>
  grid.value
    ?.querySelector<HTMLElement>('[aria-checked="true"]')
    ?.scrollIntoView({ block: 'nearest', inline });
onMounted(() => showChosen('center'));
watch(
  () => model.value.emoji,
  () => nextTick(() => showChosen('nearest')),
);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="relative -mx-4">
      <div
        ref="grid"
        role="radiogroup"
        :aria-label="symbolLabel"
        class="flex gap-5 overflow-x-auto scroll-px-4 px-4 pt-1 pb-1.5"
      >
        <section
          v-for="family in families"
          :key="family.key"
          :data-group="family.key"
          class="flex shrink-0 flex-col gap-2"
          :aria-label="family.label"
        >
          <p
            class="text-xs font-bold tracking-[0.04em] whitespace-nowrap text-toned uppercase"
            aria-hidden="true"
          >
            {{ family.label }}
          </p>
          <div
            class="grid auto-cols-[44px] grid-flow-col grid-rows-[repeat(3,44px)] gap-2"
          >
            <button
              v-for="emoji in family.emojis"
              :key="emoji"
              type="button"
              role="radio"
              :aria-checked="model.emoji === emoji"
              :aria-label="emoji"
              class="flex size-11 items-center justify-center text-[21px] focus-visible:outline-2 focus-visible:outline-primary"
              :class="[
                corner,
                model.emoji === emoji
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-default'
                  : 'bg-muted',
              ]"
              :style="
                model.emoji === emoji && shade
                  ? { backgroundColor: shade.bg }
                  : undefined
              "
              @click="model = { ...model, emoji }"
            >
              <UiEmoji :emoji="emoji" />
            </button>
          </div>
        </section>
      </div>
      <!-- More to the right. -->
      <span
        class="pointer-events-none absolute inset-y-0 right-0 w-9 bg-linear-to-r from-transparent to-(--ui-bg)"
        aria-hidden="true"
      />
    </div>
    <div class="-mx-4 flex flex-col gap-1.5 border-t border-default px-4 pt-3">
      <p
        class="text-xs font-bold tracking-[0.04em] text-toned uppercase"
        aria-hidden="true"
      >
        {{ colorLabel }}
      </p>
      <div
        role="radiogroup"
        :aria-label="colorLabel"
        class="flex justify-between"
      >
        <button
          v-for="color in colors"
          :key="color.key"
          type="button"
          role="radio"
          :aria-checked="model.color === color.key"
          :aria-label="color.label"
          class="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"
          @click="model = { ...model, color: color.key }"
        >
          <span
            class="size-8"
            :class="[
              corner,
              model.color === color.key
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-default'
                : 'ring-1',
            ]"
            :style="{
              backgroundColor: color.bg,
              '--tw-ring-color':
                model.color === color.key ? 'var(--ui-primary)' : color.ring,
            }"
          />
        </button>
      </div>
    </div>
  </div>
</template>
