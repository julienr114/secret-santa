<script setup lang="ts">
// Frame of the admin area: each page is an AdminScreen (top bar with back
// button and breadcrumb, then content). Navigation goes through the lists
// of each screen; the bar « Tirages / Listes » of someone logged in is the
// application's (app.vue), and the page stops above it.
</script>

<template>
  <div
    class="min-h-[100dvh] pb-[calc(2rem+var(--tab-bar)+env(safe-area-inset-bottom))]"
  >
    <slot />
  </div>
</template>
