<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import type { Reveal } from '~/composables/queries/usePersonal';

// The result, on a gift tag: who the participant gives to, the budget
// and the date, the organiser's note, then the receiver's ideas. Turns
// over once when it appears.
const props = defineProps<{ reveal: Reveal }>();
const { t, locale } = useT();
/** Budget and date, each only when the organiser gave it. */
const tiles = computed(() =>
  [
    { label: t('participant.reveal.budget'), value: props.reveal.budget },
    {
      label: t('participant.reveal.date'),
      value: formatEventDate(props.reveal.eventDate, locale.value),
    },
  ].filter((tile) => tile.value),
);
</script>

<template>
  <UiGiftTag class="reveal-card" aria-live="polite">
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
    <dl
      v-if="tiles.length"
      class="grid gap-2"
      :class="tiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
    >
      <div
        v-for="tile in tiles"
        :key="tile.label"
        class="flex flex-col rounded-lg bg-muted px-3 py-2 text-center"
      >
        <dt class="text-xs font-semibold text-muted">{{ tile.label }}</dt>
        <dd class="font-semibold">{{ tile.value }}</dd>
      </div>
    </dl>
    <div v-if="reveal.guardianMessage" class="flex flex-col gap-1.5">
      <p class="text-xs font-bold tracking-wide text-muted uppercase">
        {{ t('participant.reveal.guardianMessage') }}
      </p>
      <UiTextPreview>{{ reveal.guardianMessage }}</UiTextPreview>
    </div>
    <template v-if="reveal.hints">
      <hr class="border-t-2 border-dashed border-default" />
      <div class="flex flex-col gap-3">
        <h2 class="font-display text-lg font-bold">
          {{ t('participant.reveal.ideas') }}
        </h2>
        <ParticipantWishList
          v-if="reveal.hints.ideas.length > 0"
          :wishes="reveal.hints.ideas"
        />
        <p v-else class="text-sm text-muted">
          {{ t('participant.reveal.noIdeas', { name: reveal.receiver.name }) }}
        </p>
      </div>
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
