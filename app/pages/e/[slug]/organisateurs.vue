<script setup lang="ts">
// The former page of the organisers: they are now a section of the
// group's settings. A link to it opens that section.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
await navigateTo(
  {
    path: `/e/${String(route.params.slug)}/reglages`,
    hash: '#organisateurs',
  },
  { replace: true },
);
</script>

<template>
  <div />
</template>
