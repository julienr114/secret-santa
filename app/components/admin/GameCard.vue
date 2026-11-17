<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import type { GuessSummary } from '~/composables/queries/useGroup';

// « Devine qui » on the follow-up of an edition (README 22.17, maquettes
// DevineSuivi and DevineSuiviRappelFait): how many have played, when the
// guesses end, and « Envoyer un rappel », once, while someone is left to
// remind and the guesses are open; then « Rappel envoyé le… ». The card
// leads to the game's setting. Never a guess.
const props = defineProps<{
  slug: string;
  editionId: string;
  guess: GuessSummary;
  participants: number;
  /** Someone has not played yet and could be reminded. */
  canRemind: boolean;
  /** The draw is revealed: the palmarès can be watched. */
  revealed?: boolean;
}>();
const emit = defineEmits<{ remind: [] }>();
const { t, locale } = useT();
const endText = useGuessEnd();

const line = computed(() =>
  [
    // « 0 sur 5 ont fait… »: nobody yet reads as a plural.
    t('adminEdition.game.players', {
      count: props.guess.players === 0 ? 2 : props.guess.players,
      players: props.guess.players,
      total: props.participants,
    }),
    props.guess.endsAt &&
      (props.guess.open
        ? t('adminEdition.game.endsOn', {
            end: endText(props.guess.endsAt),
          })
        : t('adminEdition.game.closed')),
  ]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <section
    class="relative flex items-center gap-3.5 rounded-2xl bg-default px-5 py-4 shadow-[0_1px_2px_rgba(60,30,10,0.08)] ring-1 ring-black/5"
    data-testid="game-card"
  >
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-search" class="size-5" />
    </span>
    <div class="flex min-w-0 grow flex-col gap-0.5">
      <p class="text-xs font-bold tracking-[0.04em] text-primary-ink uppercase">
        {{ t('adminEdition.game.eyebrow') }}
      </p>
      <h2 class="font-display text-xl leading-[1.2] font-bold">
        <NuxtLink
          :to="`/admin/${slug}/editions/${editionId}/reglages`"
          class="before:absolute before:inset-0 before:rounded-2xl"
          >{{ t('adminEdition.guess.title') }}</NuxtLink
        >
      </h2>
      <p class="text-sm leading-[1.4] text-toned">{{ line }}</p>
      <NuxtLink
        v-if="revealed"
        :to="`/admin/${slug}/editions/${editionId}/palmares`"
        class="relative z-1 flex min-h-9 items-center self-start text-sm font-bold text-pine-800 underline"
        data-testid="game-palmares"
        >{{ t('participant.game.discover') }}</NuxtLink
      >
      <button
        v-else-if="canRemind && !guess.reminderSentAt && guess.open"
        type="button"
        class="relative z-1 flex min-h-9 items-center self-start text-sm font-bold text-primary-ink underline"
        data-testid="game-remind"
        @click="emit('remind')"
      >
        {{ t('adminEdition.game.remind') }}
      </button>
      <p
        v-else-if="guess.reminderSentAt"
        class="flex min-h-9 items-center text-sm text-toned"
      >
        {{
          t('adminEdition.game.reminded', {
            date: formatEventDate(guess.reminderSentAt.slice(0, 10), locale),
          })
        }}
      </p>
    </div>
    <UIcon
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-dimmed"
      aria-hidden="true"
    />
  </section>
</template>
