<script setup lang="ts">
import { useSkipGameMutation } from '~/composables/queries/usePersonal';

// « Et toi, qui t'offre ton cadeau ? » (README 22.17, Correction 15,
// DevineInviteResultat): right after discovering whom one gives to, under
// the result, while one has neither played nor passed their turn. The
// count of players (never who), « Faire mon pronostic », « Je passe mon
// tour ».
const props = defineProps<{
  token: string;
  count: { played: number; total: number };
}>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const lines = useGameLines();
const skip = useSkipGameMutation(() => props.token);
const onSkip = () =>
  skip.mutate(true, {
    onError: (error) => toast.failed(errorMessage(error)),
  });
const countLine = computed(
  () =>
    lines.count(props.count, 'participant.game.inviteCount') ||
    t('participant.game.inviteNone'),
);
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-2xl bg-default p-4 ring-2 ring-primary"
    data-testid="game-invite"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-inverted"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-search" class="size-5" />
      </span>
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="font-display text-[21px] leading-[1.15] font-bold">
          {{ t('participant.game.inviteTitle') }}
        </h2>
        <p class="text-sm leading-[1.4] text-toned">{{ countLine }}</p>
      </div>
    </div>
    <UButton
      :to="`/p/${token}/devine`"
      block
      size="xl"
      class="justify-center font-bold"
      :label="t('participant.game.makeGuess')"
    />
    <button
      type="button"
      class="flex min-h-11 items-center self-center text-sm text-toned underline"
      :disabled="skip.isPending.value"
      data-testid="game-skip"
      @click="onSkip"
    >
      {{ t('participant.game.skip') }}
    </button>
  </section>
</template>
