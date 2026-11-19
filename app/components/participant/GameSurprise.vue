<script setup lang="ts">
// « Une surprise attend le groupe à la fête » (README 22.17, Correction 15,
// DevineUniquePrix): the prizes stay a surprise, never named nor counted
// before the party. With last year's figure to beat, when there is one.
defineProps<{ challenge: { found: number; total: number } | null }>();
const { t } = useT();
</script>

<template>
  <section
    class="flex items-start gap-3 rounded-2xl bg-default p-4 shadow-card"
    data-testid="game-surprise"
  >
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-sparkle" class="size-5" />
    </span>
    <div class="flex min-w-0 flex-col gap-1.5 text-[15px] leading-[1.4]">
      <p>
        <strong class="font-bold">{{ t('participant.game.surprise') }}</strong>
        {{ t('participant.game.surpriseMore') }}
      </p>
      <p
        v-if="challenge"
        class="text-sm text-toned"
        data-testid="game-challenge"
      >
        {{
          challenge.found === 0
            ? t('participant.game.challengeNone')
            : t('participant.game.challenge', {
                count: challenge.found,
                total: challenge.total,
              })
        }}
      </p>
    </div>
  </section>
</template>
