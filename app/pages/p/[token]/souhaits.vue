<script setup lang="ts">
// The wish list became the gift hints (README 22.11): its old address,
// in messages already sent, leads to them.
definePageMeta({
  redirect: (to) => `/p/${String(to.params.token)}/pistes`,
});
</script>

<template>
  <div />
</template>
