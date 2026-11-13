<script setup lang="ts">
import { errorMessage } from '~/utils/errors';

// One participant screen: a light top bar (back to the personal page on
// sub-screens), then the content, or the loading and refused-link states.
// The title stays neutral: messaging apps preview these links (README 11).
defineProps<{ back?: string; pending: boolean; error: unknown }>();
useHead({ title: 'Secret Santa' });
</script>

<template>
  <div class="min-h-dvh pb-[calc(2rem+env(safe-area-inset-bottom))]">
    <header class="pt-[env(safe-area-inset-top)]">
      <UContainer class="flex h-14 max-w-md items-center gap-1">
        <UButton
          v-if="back && !error"
          :to="back"
          variant="ghost"
          color="neutral"
          icon="i-lucide-chevron-left"
          aria-label="Retour"
          class="-ml-2"
        />
        <span class="font-display text-lg font-bold text-primary"
          >✦ Secret Santa</span
        >
      </UContainer>
    </header>
    <UContainer as="main" class="flex max-w-md flex-col gap-6 py-4">
      <div
        v-if="error"
        class="flex flex-col items-center gap-3 py-12 text-center"
      >
        <p class="text-4xl" aria-hidden="true">🔒</p>
        <h1 class="font-display text-2xl font-bold">Oups</h1>
        <p class="text-muted" role="alert">{{ errorMessage(error) }}</p>
      </div>
      <div
        v-else-if="pending"
        class="flex flex-col gap-4"
        aria-busy="true"
        aria-label="Chargement"
      >
        <USkeleton class="h-9 w-2/3 rounded-md bg-[var(--color-kraft-200)]" />
        <USkeleton class="h-40 rounded-lg bg-[var(--color-kraft-200)]" />
      </div>
      <slot v-else />
    </UContainer>
  </div>
</template>
