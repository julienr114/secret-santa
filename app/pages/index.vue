<script setup lang="ts">
// Neutral landing page: the app is only used through personal links
// (/p/[token]) and the admin area (/admin).
const { t } = useT();
</script>

<template>
  <UContainer
    as="main"
    class="flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 text-center py-8"
  >
    <p class="text-4xl" aria-hidden="true">🎁</p>
    <h1 class="font-display text-4xl font-bold text-primary">
      {{ t('common.appName') }}
    </h1>
    <p class="text-muted">
      {{ t('adminGroup.home.tagline') }}
    </p>
  </UContainer>
</template>
