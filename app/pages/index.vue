<script setup lang="ts">
// Neutral landing page: the app is only used through personal links
// (/p/[token]) and the admin area (/admin).
</script>

<template>
  <main
    class="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center"
  >
    <p class="text-4xl" aria-hidden="true">🎁</p>
    <h1 class="font-display text-4xl font-bold text-primary">Secret Santa</h1>
    <p class="text-muted">
      Ouvre le lien personnel que tu as reçu pour participer.
    </p>
  </main>
</template>
