<script setup lang="ts">
import type { Reveal } from '~/composables/queries/usePersonal';

// The result: who the participant gives to, the practical details, then
// the receiver's ideas. Turns over once when it appears.
defineProps<{ reveal: Reveal }>();
</script>

<template>
  <section
    class="reveal-card flex flex-col gap-5 rounded-xl border border-default bg-default p-6 shadow-sm"
    aria-live="polite"
  >
    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-muted">Tu offres un cadeau à</p>
      <AdminAvatar :avatar="reveal.receiver.avatar" size="lg" />
      <p
        class="font-display text-5xl font-bold break-words text-primary"
        data-testid="receiver"
      >
        {{ reveal.receiver.name }}
      </p>
    </div>
    <dl
      v-if="reveal.budget || reveal.eventDate"
      class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm"
    >
      <template v-if="reveal.budget">
        <dt class="text-muted">Budget</dt>
        <dd>{{ reveal.budget }}</dd>
      </template>
      <template v-if="reveal.eventDate">
        <dt class="text-muted">Date</dt>
        <dd>{{ reveal.eventDate }}</dd>
      </template>
    </dl>
    <p
      v-if="reveal.guardianMessage"
      class="rounded-md bg-muted p-3 text-sm whitespace-pre-line"
    >
      {{ reveal.guardianMessage }}
    </p>
    <div v-if="reveal.wishes" class="flex flex-col gap-2">
      <h2 class="text-lg font-bold">Ses idées de cadeaux</h2>
      <ParticipantWishList
        v-if="reveal.wishes.length > 0"
        :wishes="reveal.wishes"
      />
      <p v-else class="text-sm text-muted">
        {{ reveal.receiver.name }} n'a pas encore donné d'idée.
      </p>
    </div>
  </section>
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
