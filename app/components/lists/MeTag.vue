<script setup lang="ts">
// « (moi) » beside my first name, where I am on a list (docs/spec/v3/
// listes.md, « Ma partie d'une liste », ticket 147): smaller, in grey.
// Only I read it.
const { t } = useT();
</script>

<template>
  <span class="font-sans text-base font-medium text-toned" data-testid="me-tag">
    {{ t('lists.doc.meTag') }}
  </span>
</template>
