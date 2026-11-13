<script setup lang="ts">
// Frame of the admin area: each page is an AdminScreen (top bar with back
// button and breadcrumb, then content). Navigation goes through the lists
// of each screen, so there is no bottom bar.
</script>

<template>
  <div class="min-h-dvh pb-[calc(2rem+env(safe-area-inset-bottom))]">
    <slot />
  </div>
</template>
