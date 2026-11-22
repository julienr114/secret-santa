<script setup lang="ts">
import type { Reveal } from '~/composables/queries/usePersonal';

// The result, on a gift tag: who the participant gives to, then the
// receiver's hints. The budget, the date and the organiser's note are on
// the page itself, in every state (lot 16 bis). Turns
// over once when it appears.
defineProps<{
  token: string;
  reveal: Reveal;
  /** The draw is revealed (README 22.18): no turning over. */
  open?: boolean;
}>();
const { t } = useT();
</script>

<template>
  <UiGiftTag :class="open ? '' : 'reveal-card'" aria-live="polite">
    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-muted">{{ t('participant.reveal.youGiveTo') }}</p>
      <UiAvatar :avatar="reveal.receiver.avatar" size="xl" />
      <p
        class="font-display text-[52px] leading-tight font-bold break-words text-primary"
        data-testid="receiver"
      >
        {{ reveal.receiver.name }}
      </p>
    </div>
    <template v-if="reveal.hints">
      <hr class="border-t-2 border-dashed border-default" />
      <ParticipantGiverHints
        :token="token"
        :reveal="{ ...reveal, hints: reveal.hints }"
      />
    </template>
  </UiGiftTag>
</template>

<style scoped>
.reveal-card {
  animation: reveal-flip 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes reveal-flip {
  from {
    opacity: 0;
    transform: perspective(900px) rotateY(90deg) scale(0.9);
  }
  to {
    opacity: 1;
    transform: perspective(900px) rotateY(0) scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .reveal-card {
    animation: none;
  }
}
</style>
