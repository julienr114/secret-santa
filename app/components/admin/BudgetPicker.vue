<script setup lang="ts">
import { BUDGET_AMOUNTS, budgetOf, budgetPick } from '#shared/utils/budget';

// The page « Budget » of a Secret Santa (docs/spec/v3/secret-santa.md,
// « Le créer », ticket 164; V3TirageBudget, V3TirageBudgetLibre): six
// tiles, three a row, five amounts and « Sans limite », a group of radios;
// « ou »; the line « À ta façon », written in place (ticket 162) but kept
// by « Valider » only; under it, in the same white block, ideas to take.
// One choice at a time: a tile empties the line, writing or taking an
// idea lets go of the tile. What is chosen: white, its border and text
// red. The page saves the text of the choice (`v-model`).
const budget = defineModel<string>({ required: true });
const { t } = useT();

/** What each tile saves, in the language: « 15 € », « Sans limite ». */
const tiles = computed(() => [
  ...BUDGET_AMOUNTS.map((amount) =>
    t('adminEdition.budget.amount', { amount }),
  ),
  t('adminEdition.budget.unlimited'),
]);
const names = computed(() => [
  t('adminEdition.budget.names.n5'),
  t('adminEdition.budget.names.n15'),
  t('adminEdition.budget.names.n30'),
  t('adminEdition.budget.names.n50'),
  t('adminEdition.budget.names.n75'),
]);
const ideas = computed(() => [
  t('adminEdition.budget.ideas.kind'),
  t('adminEdition.budget.ideas.handmade'),
  t('adminEdition.budget.ideas.kitsch'),
  t('adminEdition.budget.ideas.upcycled'),
]);

/** The choice, from the budget as it came; then the page's own. */
const pick = ref(budgetPick(budget.value, tiles.value));
watch(
  pick,
  (next) => {
    budget.value = budgetOf(next, tiles.value);
  },
  { deep: true },
);
const onTile = (tile: number) => {
  pick.value = { tile, free: '' };
};
/**
 * The line written, or an idea taken: the tile lets go.
 * @param free - The text of the line.
 * @returns At once: nothing is saved before « Valider ».
 */
const onFree = async (free: string) => {
  pick.value = { tile: free ? null : pick.value.tile, free };
};

/** A tile, 3 a row: white, a fine border; chosen, red. */
const TILE =
  'flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-xl bg-default px-2 py-3 text-center';
</script>

<template>
  <div class="flex flex-col">
    <div
      role="radiogroup"
      :aria-label="t('adminEdition.budget.amounts')"
      class="grid grid-cols-3 gap-2.5"
      data-testid="budget-tiles"
    >
      <button
        v-for="(text, index) in tiles"
        :key="text"
        type="button"
        role="radio"
        :aria-checked="pick.tile === index"
        :aria-label="index === BUDGET_AMOUNTS.length ? text : undefined"
        :class="[
          TILE,
          pick.tile === index
            ? 'ring-[1.5px] ring-primary'
            : 'ring-1 ring-accented',
        ]"
        data-testid="budget-tile"
        @click="onTile(index)"
      >
        <span
          class="font-display text-[22px] leading-tight font-bold"
          :class="pick.tile === index ? 'text-primary-ink' : ''"
          :aria-hidden="index === BUDGET_AMOUNTS.length || undefined"
          >{{
            index === BUDGET_AMOUNTS.length
              ? t('adminEdition.budget.infinity')
              : text
          }}</span
        >
        <span
          class="text-[12.5px] leading-[1.3]"
          :class="pick.tile === index ? 'text-primary-ink' : 'text-toned'"
          :aria-hidden="index === BUDGET_AMOUNTS.length || undefined"
          >{{ index === BUDGET_AMOUNTS.length ? text : names[index] }}</span
        >
      </button>
    </div>

    <div
      class="my-7 flex items-center gap-3 text-[13px] font-bold text-toned"
      aria-hidden="true"
    >
      <span class="h-px grow bg-accented" />
      {{ t('adminEdition.budget.or') }}
      <span class="h-px grow bg-accented" />
    </div>

    <UiList>
      <UiInlineTextRow
        :label="t('adminEdition.budget.free')"
        :value="pick.free"
        :placeholder="t('adminEdition.budget.freePlaceholder')"
        :maxlength="60"
        quiet
        :save="onFree"
        class="border-b-0"
        data-testid="budget-free"
      />
      <li
        class="flex flex-wrap gap-2 px-4 pb-3.5"
        role="group"
        :aria-label="t('adminEdition.budget.ideasLabel')"
        data-testid="budget-ideas"
      >
        <button
          v-for="idea in ideas"
          :key="idea"
          type="button"
          class="relative inline-flex h-[30px] items-center rounded-full px-3 text-[13.5px] font-semibold whitespace-nowrap after:absolute after:inset-x-0 after:-inset-y-[7px]"
          :class="
            pick.tile === null && pick.free === idea
              ? 'bg-default text-primary-ink ring-[1.5px] ring-primary'
              : 'bg-muted'
          "
          :aria-pressed="pick.tile === null && pick.free === idea"
          @click="onFree(idea)"
        >
          {{ idea }}
        </button>
      </li>
    </UiList>
  </div>
</template>
