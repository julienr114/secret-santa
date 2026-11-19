<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { daysLeft } from '#server/utils/nudges';
import type { GuessSummary } from '~/composables/queries/useGroup';

// « Devine qui » on the follow-up of an edition (README 22.17, maquettes
// DevineSuivi, DevineSuiviRelance and DevineSuiviRappelFait): how many
// have played, when the guesses end, and the reminder, as often as the
// organiser wants (Correction 15): « Envoyer un rappel », then « Dernier
// rappel le… » and « Rappeler encore ». Five days before the end, while
// someone is left, the card stands out with « Leur rappeler ». A tap on
// the card opens the game's setting in its sheet. Never a guess.
const props = defineProps<{
  slug: string;
  editionId: string;
  guess: GuessSummary;
  /** Someone is left to remind. */
  canRemind: boolean;
  /** The draw is revealed: the palmarès can be watched. */
  revealed?: boolean;
}>();
const emit = defineEmits<{ remind: []; settings: [] }>();
const { t, locale } = useT();
const endText = useGuessEnd();

const playersLine = computed(() =>
  t('adminEdition.game.players', {
    // « 0 sur 5 ont fait… »: nobody yet reads as a plural.
    count: props.guess.players === 0 ? 2 : props.guess.players,
    players: props.guess.players,
    total: props.guess.total,
  }),
);
const line = computed(() =>
  [
    playersLine.value,
    props.guess.endsAt &&
      (props.guess.open
        ? t('adminEdition.game.endsOn', { end: endText(props.guess.endsAt) })
        : t('adminEdition.game.closed')),
  ]
    .filter(Boolean)
    .join(' '),
);
// The days left are read in this browser's zone, once mounted.
const days = ref<number | null>(null);
onMounted(() => {
  if (!props.guess.endsAt) return;
  days.value = daysLeft(
    props.guess.endsAt,
    new Date().toISOString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
});
/** The suggested reminder (DevineSuiviRelance). */
const nudge = computed(
  () => props.guess.nudge && !props.revealed && props.canRemind,
);
const nudgeEnd = computed(() =>
  days.value === null
    ? ''
    : days.value <= 0
      ? t('adminEdition.game.nudgeToday')
      : t('adminEdition.game.nudgeEnd', { count: days.value }),
);
const canAct = computed(
  () => props.canRemind && props.guess.open && !props.revealed,
);
</script>

<template>
  <section
    class="relative flex items-center gap-3.5 rounded-2xl bg-default px-5 py-4"
    :class="nudge ? 'ring-2 ring-primary' : 'shadow-card'"
    data-testid="game-card"
    :data-nudge="nudge || undefined"
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
        <!-- The game's setting opens at once (asked by Julien on 18
             November 2026); once revealed, it no longer changes, and the
             whole card opens the palmarès. -->
        <NuxtLink
          v-if="revealed"
          :to="`/admin/${slug}/editions/${editionId}/palmares`"
          class="before:absolute before:inset-0 before:rounded-2xl"
          data-testid="game-palmares"
          >{{ t('adminEdition.guess.title') }}</NuxtLink
        >
        <button
          v-else
          type="button"
          class="text-left before:absolute before:inset-0 before:rounded-2xl"
          data-testid="game-settings"
          @click="emit('settings')"
        >
          {{ t('adminEdition.guess.title') }}
        </button>
      </h2>
      <template v-if="nudge">
        <p class="text-sm leading-[1.4] font-bold">
          {{ t('adminEdition.game.nudgeLeft', { count: guess.left }) }}
        </p>
        <p class="text-sm leading-[1.4] text-toned">{{ nudgeEnd }}</p>
        <UButton
          class="relative z-1 mt-2 self-start font-bold"
          :label="t('adminEdition.game.nudgeButton')"
          data-testid="game-remind"
          @click="emit('remind')"
        />
      </template>
      <template v-else>
        <p class="text-sm leading-[1.4] text-toned">{{ line }}</p>
        <p
          v-if="guess.reminderSentAt && !revealed"
          class="mt-1 text-sm text-toned"
        >
          {{
            t('adminEdition.game.lastReminder', {
              date: formatEventDate(guess.reminderSentAt.slice(0, 10), locale),
            })
          }}
        </p>
        <span
          v-if="revealed"
          class="flex min-h-9 items-center self-start text-sm font-bold text-success-ink underline"
          >{{ t('participant.game.discover') }}</span
        >
        <button
          v-else-if="canAct"
          type="button"
          class="relative z-1 flex min-h-9 items-center self-start text-sm font-bold text-primary-ink underline"
          data-testid="game-remind"
          @click="emit('remind')"
        >
          {{
            guess.reminderSentAt
              ? t('adminEdition.game.remindAgain')
              : t('adminEdition.game.remind')
          }}
        </button>
      </template>
    </div>
    <UIcon
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-dimmed"
      aria-hidden="true"
    />
  </section>
</template>
