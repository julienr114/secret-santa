<script setup lang="ts">
import type { GuessMode } from '#server/utils/guesses';

// « Devine qui », put forward in the form of a new Secret Santa
// (docs/spec/v3/secret-santa.md, ticket 150; V3TirageNouveau,
// V3TirageNouveauQui, V3TirageNouveauSans): the light green card of the
// game, the loupe, three choices on the card itself, and a sentence that
// changes with the choice. Under four participants, the game does not
// open: the card says so instead.
defineProps<{
  /** At least four participants: the game may open. */
  possible: boolean;
}>();
const mode = defineModel<GuessMode>({ required: true });
const { t } = useT();
const items = computed(() =>
  (['none', 'santa', 'all'] as const).map((value) => ({
    value,
    label: t(`adminEdition.guess.choice.${value}`),
  })),
);
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-[28px] bg-game-tint px-4 pt-3.5 pb-4 shadow-[0_0_0_1.5px_var(--color-game-ring)]"
    data-testid="guess-card"
  >
    <div class="flex items-center gap-3">
      <span
        class="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-mint-500 text-white"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-search" class="size-[19px]" />
      </span>
      <div class="flex flex-col gap-px">
        <h2 class="font-display text-lg font-bold">
          {{ t('adminEdition.guess.title') }}
        </h2>
        <p class="text-[13px] leading-[1.35] text-game-ink">
          {{ t('adminEdition.guess.tagline') }}
        </p>
      </div>
    </div>
    <UiSegmented
      v-model="mode"
      tone="game"
      :items="items"
      :label="t('adminEdition.guess.title')"
      class="grid-cols-[0.7fr_1fr_1.25fr]"
      data-testid="guess-choice"
    />
    <p
      class="px-0.5 text-[13px] leading-[1.4] text-game-ink"
      data-testid="guess-pitch"
    >
      {{
        possible
          ? t(`adminEdition.guess.pitch.${mode}`)
          : t('adminEdition.guess.needsFour')
      }}
    </p>
  </section>
</template>
