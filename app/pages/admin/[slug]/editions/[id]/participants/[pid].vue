<script setup lang="ts">
// The former page of a participant: its actions now live in the send
// sheet of the edition. A link to it opens that sheet.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
await navigateTo(
  {
    path: `/admin/${String(route.params.slug)}/editions/${String(route.params.id)}`,
    query: { envoyer: String(route.params.pid) },
  },
  { replace: true },
);
</script>

<template>
  <div />
</template>
